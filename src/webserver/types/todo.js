// Home Assistant todo card.
var TODO_CARD_METADATA = {
  entity: {
    label: "Entity",
    idSuffix: "todo-entity",
    placeholder: "e.g. todo.shopping",
    domains: function () { return cardContractDomains("todo"); },
    bindName: "entity",
    rerender: true,
    requiredMessage: "Add a todo entity before saving.",
  },
  labelField: {
    label: "Label",
    idSuffix: "todo-label",
    field: "label",
    placeholder: "e.g. Shopping",
    rerender: true,
  },
  icon: {
    pickerIdSuffix: "todo-icon-picker",
    idSuffix: "todo-icon",
    field: "icon",
    fallback: "Check",
  },
  countDisplay: {
    label: "Status",
    options: [
      ["icon", "Icon"],
      ["count", "Item Counter"],
      ["top_task", "Top Task"],
    ],
    value: function (b) {
      return todoCardStatusMode(b);
    },
    onSelect: function (button, cardHelpers, value) {
      setTodoCardStatusMode(button, value);
      cardHelpers.saveField("options", button.options);
    },
  },
  labelDisplay: {
    label: "Card Label",
    options: [
      ["label", "List Name"],
      ["count", "Item Count"],
    ],
    value: function (b) {
      return todoCardLabelShowsCount(b) ? "count" : "label";
    },
    onSelect: function (button, cardHelpers, value) {
      setTodoCardLabelShowsCount(button, value === "count");
      cardHelpers.saveField("options", button.options);
    },
  },
  completedDisplay: {
    label: "Show Completed Items",
    idSuffix: "todo-show-completed",
    checked: function (b) { return todoCardShowsCompletedItems(b); },
    onChange: function (button, cardHelpers, checked) {
      setTodoCardShowsCompletedItems(button, checked);
      cardHelpers.saveField("options", button.options);
    },
  },
  largeNumbers: {
    label: "Large Item Count",
    idSuffix: "large-item-count",
    supported: function (b) {
      return todoCardStatusMode(b) === "count";
    },
  },
  preview: {
    badge: "check",
  },
};

function normalizeTodoConfig(b) {
  if (!b) return;
  b.sensor = "";
  b.unit = "";
  b.precision = "";
  b.options = normalizeTodoOptions(b.options);
  b.icon_on = "Auto";
  if (!b.icon || b.icon === "Auto") b.icon = "Check";
}

registerButtonType("todo", {
  label: function () { return cardContractCardLabel("todo"); },
  allowInSubpage: function () { return cardContractAllowInSubpage("todo"); },
  pickerKey: function () { return cardContractPickerKey("todo"); },
  experimental: function () { return cardContractExperimental("todo"); },
  hidden: function () { return cardContractHidden("todo"); },
  showSelectedWhenExperimentalHidden: false,
  hideLabel: true,
  defaultConfig: function () { return cardContractDefaultConfig("todo"); },
  cardMetadata: TODO_CARD_METADATA,
  onSelect: function (b) {
    b.entity = "";
    b.label = "";
    b.icon = "Check";
    normalizeTodoConfig(b);
  },
  renderSettings: function (panel, b, slot, helpers) {
    normalizeTodoConfig(b);
    helpers.renderCardEntityField(panel, b, helpers, TODO_CARD_METADATA);
    helpers.renderCardTextField(panel, b, helpers, TODO_CARD_METADATA.labelField);

    helpers.renderCardSegmentControl(panel, b, helpers, Object.assign({}, TODO_CARD_METADATA.labelDisplay, {
      onSelect: function (button, cardHelpers, value) {
        setTodoCardLabelShowsCount(button, value === "count");
        cardHelpers.saveField("options", button.options);
        scheduleRender();
      },
    }));

    helpers.renderCardSegmentControl(panel, b, helpers, Object.assign({}, TODO_CARD_METADATA.countDisplay, {
      onSelect: function (button, cardHelpers, value) {
        setTodoCardStatusMode(button, value);
        cardHelpers.saveField("options", button.options);
        syncIconPicker();
        syncLargeItemCount();
        scheduleRender();
      },
    }));
    var largeNumbersToggle = helpers.renderCardLargeNumbersToggle(panel, b, helpers, TODO_CARD_METADATA);
    var iconSection = condField();
    iconSection.classList.add("sp-climate-settings-gap");
    helpers.renderCardIconPicker(iconSection, b, helpers, TODO_CARD_METADATA.icon);
    panel.appendChild(iconSection);

    helpers.renderCardOptionToggle(panel, b, helpers, TODO_CARD_METADATA.completedDisplay);
    function syncIconPicker() {
      iconSection.classList.toggle("sp-visible", !todoCardShowCount(b));
    }
    function syncLargeItemCount() {
      helpers.syncCardLargeNumbersToggle(largeNumbersToggle, b, helpers, todoCardStatusMode(b) === "count");
    }
    syncIconPicker();
    syncLargeItemCount();
  },
  renderPreview: function (b, helpers) {
    var label = todoCardLabelShowsCount(b) ? "3" : (b.label || b.entity || "Todo");
    var statusMode = todoCardStatusMode(b);
    return {
      iconHtml: statusMode === "icon"
        ? '<span class="sp-btn-icon mdi mdi-' + iconSlug(b.icon || "Check") + '"></span>'
        : statusMode === "top_task"
        ? cardSensorPreviewHtml(b, helpers, "Buy milk", null, "sp-todo-task-preview", "sp-media-now-title")
        : cardSensorPreviewHtml(b, helpers, "3", ""),
      labelHtml: cardBadgeLabelHtml(helpers, label, TODO_CARD_METADATA.preview.badge),
    };
  },
});
