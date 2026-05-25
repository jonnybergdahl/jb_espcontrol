// Light temperature slider card: controls color_temp_kelvin on a light entity.
// Slider bottom = min kelvin (warm), top = max kelvin (cool).
// Config fields: unit="min-max" (kelvin range),
// precision="color" (dynamic fill color by current temperature),
// sensor is unused; legacy "kelvin" values are ignored by firmware.

function lightTempParseRange(unit) {
  var parts = (unit || "2000-6500").split("-");
  var mn = parseInt(parts[0], 10);
  var mx = parseInt(parts[1], 10);
  if (!isFinite(mn) || mn < 1000) mn = 2000;
  if (!isFinite(mx) || mx <= mn) mx = 6500;
  return [mn, mx];
}

function lightTempClampMin(v, absMin) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) n = absMin;
  if (n < absMin) n = absMin;
  if (n > 9900) n = 9900;
  return n;
}

function lightTempClampMax(v, mn) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) n = mn + 100;
  if (n <= mn) n = mn + 100;
  if (n > 10000) n = 10000;
  return n;
}

var LIGHT_CONTROL_TYPE_OPTIONS = [
  ["light_switch", "Switch"],
  ["light_brightness", "Brightness"],
  ["light_temperature", "Colour Temperature"],
];

var LIGHT_CONTROL_TYPE_METADATA = {
  mode: {
    label: "Type",
    idSuffix: "light-control-type",
    options: LIGHT_CONTROL_TYPE_OPTIONS,
    value: function (b) { return normalizeLightControlType(b.type); },
    onChange: function (b, helpers) {
      setLightControlType(b, this.value, helpers);
    },
  },
};

var LIGHT_TEMPERATURE_CARD_METADATA = {
  mode: LIGHT_CONTROL_TYPE_METADATA.mode,
  entity: {
    label: "Entity",
    placeholder: "e.g. light.living_room",
    domains: function () { return cardContractDomains("light_temperature"); },
  },
  labelField: {
    label: "Label",
    placeholder: "e.g. Living Room",
  },
  icon: {
    field: "icon",
    fallback: "Auto",
  },
  preview: {
    badge: "lightbulb",
  },
};

function normalizeLightControlType(type) {
  if (type === "light_switch") return "light_switch";
  return type === "light_temperature" ? "light_temperature" : "light_brightness";
}

function setLightControlType(b, type, helpers) {
  var nextType = normalizeLightControlType(type);
  if (b.type === nextType) return;
  b.type = nextType;
  var td = BUTTON_TYPES[nextType];
  if (td && td.onSelect) td.onSelect(b);
  helpers.saveField("type", nextType);
  helpers.saveField("sensor", b.sensor || "");
  helpers.saveField("unit", b.unit || "");
  helpers.saveField("precision", b.precision || "");
  helpers.saveField("icon", b.icon || "Auto");
  helpers.saveField("icon_on", b.icon_on || "Auto");
  renderButtonSettings();
}

function renderLightControlTypeField(panel, b, helpers) {
  return helpers.renderCardModeSelector(panel, b, helpers, LIGHT_CONTROL_TYPE_METADATA);
}

registerButtonType("light_temperature", {
  label: function () { return cardContractCardLabel("light_temperature"); },
  allowInSubpage: function () { return cardContractAllowInSubpage("light_temperature"); },
  hideLabel: true,
  pickerKey: function () { return cardContractPickerKey("light_temperature"); },
  experimental: function () { return cardContractExperimental("light_temperature"); },
  hidden: function () { return cardContractHidden("light_temperature"); },
  defaultConfig: function () { return cardContractDefaultConfig("light_temperature"); },
  isAvailable: function () {
    return false;
  },
  labelPlaceholder: "e.g. Living Room",
  cardMetadata: LIGHT_TEMPERATURE_CARD_METADATA,
  onSelect: function (b) {
    b.sensor = "";
    b.unit = "2000-6500";
    b.precision = "";
    b.icon = "Lightbulb";
    b.icon_on = "Auto";
  },
  renderSettings: function (panel, b, slot, helpers) {
    renderLightControlTypeField(panel, b, helpers);

    helpers.renderCardEntityField(panel, b, helpers, LIGHT_TEMPERATURE_CARD_METADATA);
    helpers.renderCardTextField(panel, b, helpers, LIGHT_TEMPERATURE_CARD_METADATA.labelField);

    if (b.sensor === "kelvin") {
      b.sensor = "";
      helpers.saveField("sensor", "");
    }

    // Kelvin range
    var range = lightTempParseRange(b.unit);
    var curMin = range[0], curMax = range[1];

    function saveRange(mn, mx) {
      b.unit = mn + "-" + mx;
      helpers.saveField("unit", b.unit);
    }

    var minF = document.createElement("div");
    minF.className = "sp-field";
    minF.appendChild(helpers.fieldLabel("Min Color Temp (K)", helpers.idPrefix + "kmin"));
    var minInp = document.createElement("input");
    minInp.type = "number";
    minInp.className = "sp-input";
    minInp.id = helpers.idPrefix + "kmin";
    minInp.min = "1000";
    minInp.max = "9900";
    minInp.step = "100";
    minInp.placeholder = "2000";
    minInp.value = curMin;
    minF.appendChild(minInp);
    panel.appendChild(minF);

    var maxF = document.createElement("div");
    maxF.className = "sp-field";
    maxF.appendChild(helpers.fieldLabel("Max Color Temp (K)", helpers.idPrefix + "kmax"));
    var maxInp = document.createElement("input");
    maxInp.type = "number";
    maxInp.className = "sp-input";
    maxInp.id = helpers.idPrefix + "kmax";
    maxInp.min = "1100";
    maxInp.max = "10000";
    maxInp.step = "100";
    maxInp.placeholder = "6500";
    maxInp.value = curMax;
    maxF.appendChild(maxInp);
    panel.appendChild(maxF);

    function onRangeChange() {
      var mn = lightTempClampMin(minInp.value, 1000);
      var mx = lightTempClampMax(maxInp.value, mn);
      minInp.value = mn;
      maxInp.value = mx;
      saveRange(mn, mx);
    }
    minInp.addEventListener("change", onRangeChange);
    maxInp.addEventListener("change", onRangeChange);
    minInp.addEventListener("blur", onRangeChange);
    maxInp.addEventListener("blur", onRangeChange);

    helpers.renderCardIconPicker(panel, b, helpers, LIGHT_TEMPERATURE_CARD_METADATA.icon);
  },
  renderPreview: function (b, helpers) {
    var label = b.label || b.entity || "Light Temp";
    var iconName = b.icon && b.icon !== "Auto" ? iconSlug(b.icon) : "lightbulb";
    return {
      iconHtml:
        '<span class="sp-btn-icon mdi mdi-' + iconName + '"></span>' +
        '<span class="sp-slider-preview"><span class="sp-slider-track">' +
          '<span class="sp-slider-fill"></span>' +
        '</span></span>',
      labelHtml: cardBadgeLabelHtml(helpers, label, LIGHT_TEMPERATURE_CARD_METADATA.preview.badge),
    };
  },
});
