// *** BUDGET CONTROLLER
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    totalIncome > 0
      ? (this.percentage = Math.round((this.value / totalIncome) * 100))
      : (this.percentage = -1);
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calcuateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      //create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      }
      //push it ito data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;
      //returns a new array
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      //finds the index for the id that needs to be deleted
      index = ids.indexOf(id);

      //removes the id
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //calc total income and  expense
      calcuateTotal('exp');
      calcuateTotal('inc');
      // calcuate the budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;

      // calcuate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

// *** UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    containter: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    /**
    + or - before number
    exactly 2 decimal points
    comma separating the thousands

    2310.4697 -> + 2,310.47
    2000 -> + 2,000.00
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 23510 -> 23,510
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // will be either income or expense
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;

      //create html string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //insert html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //Removes item from either Income or Expenses lists
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );

      //convert List into Array
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, type);

      obj.percentage > 0
        ? (document.querySelector(DOMstrings.percentageLabel).textContent =
            obj.percentage + '%')
        : (document.querySelector(DOMstrings.percentageLabel).textContent =
            '---');
    },

    displayPercentages: function(percentages) {
      var fields;

      fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        percentages[index] > 0
          ? (current.textContent = percentages[index] + '%')
          : (current.textContent = '---');
      });
    },

    displayMonth: function() {
      var now, year, month, months;

      now = new Date();
      year = now.getFullYear();

      months = [
        'January',
        'Feburary',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changeType: function() {
      var fields;
      fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

// *** GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  function setupEventListeners() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      //if the ENTER key was pressed
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.containter)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changeType);
  }

  var updateBudget = function() {
    //1.  calc the budget
    budgetCtrl.calculateBudget();

    //2. return the budget
    var budget = budgetCtrl.getBudget();

    //3. display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //1. Calcuate Percentages
    budgetCtrl.calculatePercentages();

    //2. read percentages form the budget controller
    var percentages = budgetCtrl.getPercentages();

    //3. update UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    //1. get the field input data
    input = UIController.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      //2. add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear the fields
      UICtrl.clearFields();

      //5. Calc and update budget
      updateBudget();

      //6.update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, id;

    //DOM Tranversing
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      id = parseInt(splitID[1]);

      //1. delete item from the data structure
      budgetCtrl.deleteItem(type, id);

      //2. delete the item from the UI
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();

      //4. update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('app has stated');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalExp: 0,
        totalInc: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
