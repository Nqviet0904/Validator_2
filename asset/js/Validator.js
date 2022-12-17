function Validator(formSelector) {
  var _this = this;
  var formRules = {};
  /**
   * Quy ước tạo rule:
   * - Nếu có lỗi thì return `error message`
   * - Nếu không lỗi thì return undefined
   */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : "Vui lòng nhập trường này";
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Vui lòng nhập Email";
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự `;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= min
          ? undefined
          : `Vui lòng nhập tối đa ${max} kí tự `;
      };
    },
  };
  var isrequired = "required";
  // console.log(validatorRules[isrequired](""));
  // Lấy ra form element trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);
  // Chỉ xử lý khi có element trong DOM
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");
    for (var input of inputs) {
      var rules = input.getAttribute("rules").split("|");
      var ruleInfo;
      for (var rule of rules) {
        var isRuleHasValue = rule.includes(":");
        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
          // console.log( validatorRules[rule](ruleInfo[1]));
        }
        var ruleFunc = validatorRules[rule];
        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }
        // console.log(rule);
        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }
      // Lắng nghe sự kiện để validate (blur, change,..)
      input.onblur = handelValidate;
      input.oninput = handelClearError;
    }
    // Hàm thực hiện validate
    function handelValidate(event) {
      var rules = formRules[event.target.name];
      var errorMessage;
      for (var rule of rules) {
        errorMessage = rule(event.target.value);
        if (errorMessage) break;
      }
      // Nếu có lỗi thì hiện thị message lỗi ra UI
      if (errorMessage) {
        // Hàm closest tìm ra thằng cha hoặc tổ tiên
        // có thể viết hàm getParent() ở form 1 thay cho closest.
        var formGroup = event.target.closest(".form-group");
        if (formGroup) {
          formGroup.classList.add("invalid");
          var formMessage = formGroup.querySelector(".form-message");
          if (formMessage) {
            formMessage.innerText = errorMessage;
          }
        }
      }
      return !errorMessage;
    }
    // Hàm clear message lỗi
    function handelClearError(event) {
      var formGroup = event.target.closest(".form-group");
      if (formGroup.classList.contains("invalid")) {
        formGroup.classList.remove("invalid");
      }
      var formMessage = formGroup.querySelector(".form-message");
      if (formMessage) {
        formMessage.innerText = "";
      }
    }

    // Xử lí hành vi submit forrm
    formElement.onsubmit = function (e) {
      e.preventDefault();
      // console.log(this);
      console.log(_this);

      var inputs = formElement.querySelectorAll("[name][rules]");
      var isValid = true;
      for (var input of inputs) {
        if (!handelValidate({ target: input })) {
          isValid = false;
        }
      }
      // Khi không có lỗi thì submit for
      if (isValid) {
        if (typeof _this.onSubmit === "function") {
          var enableInput = formElement.querySelectorAll(
            "[name]:not([disable])"
          );
          var formValues = Array.from(enableInput).reduce(function (
            values,
            input
          ) {
            // values[input.name] = input.value;
            switch (input.type) {
              case "radio": {
                if (input.matches(":checked")) {
                  values[input.name] = input.value;
                }
                break;
              }
              case "checkbox": {
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              }
              case "file": {
                values[input.name] = input.file;
                break;
              }
              default:
                values[input.name] = input.value;
            }
            return values;
          },
          {});
          // Gọi lại hàm obSubmit và trả về  kèm giá trị của form
          _this.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };
  }
}
