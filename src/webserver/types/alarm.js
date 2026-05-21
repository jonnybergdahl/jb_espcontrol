// Alarm cards: one-tap alarm_control_panel actions.
var ALARM_CONTROL_PANEL_VALUE = "control_panel";

function alarmUsesDefaultIcon(icon) {
  return !icon || icon === "Auto" || icon === "Security" || icon === "Alarm";
}

function alarmCardTypeOptions() {
  var options = [
    { value: ALARM_CONTROL_PANEL_VALUE, label: "Combined Control" },
  ];
  for (var i = 0; i < ALARM_ACTIONS.length; i++) options.push(ALARM_ACTIONS[i]);
  return options;
}

function alarmLabelIsGenerated(label) {
  if (!label) return true;
  for (var i = 0; i < ALARM_ACTIONS.length; i++) {
    if (label === ALARM_ACTIONS[i].label) return true;
  }
  return false;
}

function alarmIconIsGenerated(icon) {
  if (!icon || icon === "Auto" || alarmUsesDefaultIcon(icon)) return true;
  for (var i = 0; i < ALARM_ACTIONS.length; i++) {
    if (icon === ALARM_ACTIONS[i].icon) return true;
  }
  return false;
}

function setAlarmCardType(b, value, helpers) {
  var info = alarmActionInfo(value);
  var wasAlarmAction = b.type === "alarm_action";

  if (value === ALARM_CONTROL_PANEL_VALUE || !info) {
    var shouldUseControlLabel = wasAlarmAction && alarmLabelIsGenerated(b.label);
    var shouldUseControlIcon = alarmIconIsGenerated(b.icon);
    b.type = "alarm";
    b.sensor = "";
    b.unit = "";
    b.precision = "";
    b.icon_on = "Auto";
    if (shouldUseControlLabel) b.label = "";
    if (shouldUseControlIcon) b.icon = "Security";
    b.options = normalizeAlarmOptions(b.options);

    helpers.saveField("type", b.type);
    helpers.saveField("sensor", "");
    helpers.saveField("unit", "");
    helpers.saveField("precision", "");
    helpers.saveField("icon_on", "Auto");
    helpers.saveField("label", b.label || "");
    helpers.saveField("icon", b.icon || "Security");
    helpers.saveField("options", b.options || "");
    renderButtonSettings();
    return;
  }

  info = info || ALARM_ACTIONS[0];
  var oldInfo = alarmActionInfo(b.sensor);
  var shouldUseGeneratedLabel = !wasAlarmAction || alarmLabelIsGenerated(b.label);
  var shouldUseGeneratedIcon = !wasAlarmAction || alarmIconIsGenerated(b.icon) ||
    (oldInfo && b.icon === oldInfo.icon);

  b.type = "alarm_action";
  b.sensor = info.value;
  b.unit = "";
  b.precision = "";
  b.icon_on = "Auto";
  if (shouldUseGeneratedLabel) b.label = info.label;
  if (shouldUseGeneratedIcon) b.icon = info.icon;
  b.options = normalizeAlarmOptions(b.options);

  helpers.saveField("type", b.type);
  helpers.saveField("sensor", b.sensor || "");
  helpers.saveField("unit", "");
  helpers.saveField("precision", "");
  helpers.saveField("icon_on", "Auto");
  helpers.saveField("label", b.label || "");
  helpers.saveField("icon", b.icon || "Auto");
  helpers.saveField("options", b.options || "");
  renderButtonSettings();
}

function renderAlarmCardTypeField(panel, b, helpers) {
  var options = alarmCardTypeOptions();
  if (helpers.isSub) options = options.slice(1);
  var value = b.type === "alarm"
    ? ALARM_CONTROL_PANEL_VALUE
    : (alarmActionInfo(b.sensor) || ALARM_ACTIONS[0]).value;
  panel.appendChild(helpers.selectField(
    "Type",
    helpers.idPrefix + "alarm-card-type",
    alarmCardTypeOptions(),
    value,
    function () {
      setAlarmCardType(b, this.value, helpers);
    }
  ).field);
}

registerButtonType("alarm", {
  label: "Alarm",
  allowInSubpage: true,
  hideLabel: true,
  labelPlaceholder: "e.g. House Alarm",
  onSelect: function (b) {
    b.entity = "";
    b.label = "";
    b.sensor = "";
    b.unit = "";
    b.precision = "";
    b.icon = "Security";
    b.icon_on = "Auto";
    b.options = "";
  },
  renderSettingsBeforeLabel: function (panel, b, slot, helpers) {
    renderAlarmCardTypeField(panel, b, helpers);
  },
  renderSettings: function (panel, b, slot, helpers) {
    if (helpers.isSub) {
      setAlarmCardType(b, "away", helpers);
      return;
    }
    b.sensor = "";
    b.unit = "";
    b.precision = "";
    b.icon_on = "Auto";
    if (!b.icon || b.icon === "Auto") b.icon = "Security";
    var normalizedOptions = normalizeAlarmOptions(b.options);
    if (b.options !== normalizedOptions) {
      b.options = normalizedOptions;
      helpers.saveField("options", normalizedOptions);
    }

    var entityField = helpers.entityField(
      "Alarm Entity",
      helpers.idPrefix + "alarm-entity",
      b.entity,
      "e.g. alarm_control_panel.house",
      ["alarm_control_panel"],
      "entity",
      true,
      "Add an alarm_control_panel entity before saving."
    );
    panel.appendChild(entityField.field);

    function setActive(buttons, value) {
      for (var key in buttons) buttons[key].classList.toggle("active", key === value);
    }

    var labelControl = helpers.textField(
      "Label", helpers.idPrefix + "alarm-label", b.label, "e.g. House Alarm", "label", true);

    function setLabelVisible(value) {
      labelControl.field.style.display = value === "name" ? "" : "none";
    }

    var labelDisplayField = helpers.segmentControl([
      ["name", "Name"],
      ["status", "Status"],
    ], alarmLabelDisplayMode(b), function (value) {
      setActive(labelDisplayField.buttons, value);
      setAlarmLabelDisplayMode(b, value);
      helpers.saveField("options", b.options);
      setLabelVisible(value);
      scheduleRender();
    });
    panel.appendChild(helpers.fieldWithControl("Label Display", null, labelDisplayField.segment));
    setLabelVisible(alarmLabelDisplayMode(b));
    panel.appendChild(labelControl.field);

    var iconControl = helpers.iconPickerField(
      helpers.idPrefix + "alarm-icon-picker", helpers.idPrefix + "alarm-icon",
      b.icon || "Security", function (opt) {
        b.icon = opt || "Security";
        helpers.saveField("icon", b.icon);
      }, "Icon"
    );

    function setIconVisible(value) {
      iconControl.style.display = value === "static" ? "" : "none";
    }

    var iconDisplayField = helpers.segmentControl([
      ["static", "Static"],
      ["status", "Status"],
    ], alarmIconDisplayMode(b), function (value) {
      setActive(iconDisplayField.buttons, value);
      setAlarmIconDisplayMode(b, value);
      helpers.saveField("options", b.options);
      setIconVisible(value);
      scheduleRender();
    });
    panel.appendChild(helpers.fieldWithControl("Icon Display", null, iconDisplayField.segment));
    setIconVisible(alarmIconDisplayMode(b));
    panel.appendChild(iconControl);

    function savePinOptions() {
      setAlarmPinRequired(b, "arm", armPinToggle.input.checked);
      setAlarmPinRequired(b, "disarm", disarmPinToggle.input.checked);
      helpers.saveField("options", b.options);
    }

    var armPinToggle = helpers.toggleRow(
      "PIN required for arming",
      helpers.idPrefix + "alarm-pin-arm",
      alarmPinRequired(b, "arm")
    );
    var disarmPinToggle = helpers.toggleRow(
      "PIN required for disarming",
      helpers.idPrefix + "alarm-pin-disarm",
      alarmPinRequired(b, "disarm")
    );
    panel.appendChild(armPinToggle.row);
    panel.appendChild(disarmPinToggle.row);
    armPinToggle.input.addEventListener("change", savePinOptions);
    disarmPinToggle.input.addEventListener("change", savePinOptions);
  },
  renderPreview: function (b, helpers) {
    var label = (b.label && b.label.trim()) || (b.entity && b.entity.trim()) || "Alarm";
    if (alarmLabelDisplayMode(b) === "status") label = "Disarmed";
    var iconName = iconSlug(b.icon && b.icon !== "Auto" ? b.icon : "Security");
    if (alarmIconDisplayMode(b) === "status") iconName = iconSlug("Lock Open");
    return {
      iconHtml: '<span class="sp-btn-icon mdi mdi-' + iconName + '"></span>',
      labelHtml: '<span class="sp-btn-label">' + helpers.escHtml(label) + '</span>',
    };
  },
});

registerButtonType("alarm_action", {
  label: "Alarm",
  allowInSubpage: true,
  labelPlaceholder: "e.g. Arm Away",
  pickerKey: "alarm",
  isAvailable: function () { return false; },
  onSelect: function (b) {
    var info = ALARM_ACTIONS[0];
    b.entity = "";
    b.label = info.label;
    b.sensor = info.value;
    b.unit = "";
    b.icon = info.icon;
    b.icon_on = "Auto";
    b.precision = "";
    b.options = "";
  },
  renderSettingsBeforeLabel: function (panel, b, slot, helpers) {
    b.sensor = alarmActionInfo(b.sensor) ? b.sensor : "away";
    renderAlarmCardTypeField(panel, b, helpers);
  },
  renderSettings: function (panel, b, slot, helpers) {
    b.sensor = alarmActionInfo(b.sensor) ? b.sensor : "away";
    b.unit = "";
    b.precision = "";
    b.icon_on = "Auto";
    b.options = normalizeAlarmOptions(b.options);

    var entityField = helpers.entityField(
      "Alarm Entity",
      helpers.idPrefix + "alarm-action-entity",
      b.entity,
      "e.g. alarm_control_panel.house",
      ["alarm_control_panel"],
      "entity",
      true,
      "Add an alarm_control_panel entity before saving."
    );
    panel.appendChild(entityField.field);

    panel.appendChild(helpers.iconPickerField(
      helpers.idPrefix + "alarm-action-icon-picker", helpers.idPrefix + "alarm-action-icon",
      b.icon || alarmActionInfo(b.sensor).icon, function (opt) {
        b.icon = opt || alarmActionInfo(b.sensor).icon;
        helpers.saveField("icon", b.icon);
      }, "Icon"
    ));

    var pinMode = b.sensor === "disarm" ? "disarm" : "arm";
    var pinToggle = helpers.toggleRow(
      "PIN required",
      helpers.idPrefix + "alarm-action-pin",
      alarmPinRequired(b, pinMode)
    );
    panel.appendChild(pinToggle.row);
    pinToggle.input.addEventListener("change", function () {
      setAlarmPinRequired(b, pinMode, this.checked);
      helpers.saveField("options", b.options);
    });
  },
  renderPreview: function (b, helpers) {
    var info = alarmActionInfo(b.sensor) || ALARM_ACTIONS[0];
    var label = b.label || info.label;
    var iconName = iconSlug(b.icon || info.icon);
    return {
      iconHtml: '<span class="sp-btn-icon mdi mdi-' + iconName + '"></span>',
      labelHtml: '<span class="sp-btn-label">' + helpers.escHtml(label) + '</span>',
    };
  },
});
