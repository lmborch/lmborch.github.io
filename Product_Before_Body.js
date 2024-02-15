
// Debugger statement for debugging
//debugger;

//Constants
const prefix = '€&nbsp;'; // Currency prefix
const minNumberOfDays = 1; // Minimum number of rental days

// Get initial rental price
let basePrice = Number($('.current-item-price').text().replace(/[^0-9.-]+/g, "")) / 100;

let subtotalPrice = 0;

// Get QTY ordered
let numberOfProducts = Number($('.w-commerce-commerceaddtocartquantityinput').val());

// Get Insurance Price and deposit price
let insurranceprice = Number($('.insurranceprice').text());
let depositprice = Number($('.depositprice').text());
let calcinsurrance = insurranceprice;
let calcdeposit = depositprice;

// Set Deposit to zero if invisible
if ($('.depositprice').hasClass('w-condition-invisible')) {
  calcdeposit = 0;
}
// Set Insurance to zero if invisible
if ($('.insurranceprice').hasClass('w-condition-invisible')) {
  calcinsurrance = 0;
}

let calcdays = 0;
let calcbaseprice = basePrice * numberOfProducts;

var submitBtn = $(".add-to-cart-button");
submitBtn.attr("disabled", true);
submitBtn.css("display", 'inline-block');

// should already be on the page
let destination = sessionStorage.getItem('destination') || '';

// Calculate days and price
const calculateDays = (date1, date2) => {
  var Difference_In_Time = moment(date2, "DD/MM/YYYY").toDate().getTime() - moment(date1, "DD/MM/YYYY").toDate().getTime();
  var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  // Calculate date difference (example: Fri-Sat is only 1 day.) But the same day (if possible) should still cost 1 day.
  calcdays = Math.max(Difference_In_Days, 1);

  $('#bookstartdate').val(moment(date1, "DD/MM/YYYY").format('DD-MM-YYYY'));
  $('#bookenddate').val(moment(date2, "DD/MM/YYYY").format('DD-MM-YYYY'));
  calculatePrice();

  if (!isNaN(calcdays)) {
    $('#booknumberofdays').val(calcdays + ' days');
    $('#TotalRentalCostLabel').text('Total (' + calcdays + ' days)');
  }
};

// On Click event
$('#addinsurrancebtn').click(function () {
  calcinsurrance = this.checked ? insurranceprice : 0;
  calculatePrice();
});

$('.w-commerce-commerceaddtocartquantityinput').change(function () {
  numberOfProducts = Number($(this).val());
  calculatePrice();
});

$(".quantity-input button").on("click", function () {
  numberOfProducts = Number($(".w-commerce-commerceaddtocartquantityinput").val());
  calculatePrice();
});

// If variant exists
if ($(".variantinput").length > 0) {
  $(".variantinput").on("change", function () {
    basePrice = Number($('.current-item-price').text().replace(/[^0-9.-]+/g, "")) / 100;
    calculatePrice();
  });
}

const calculatePrice = () => {

  // activate submit button if min. number of days is met and destination is selected
  if (calcdays >= minNumberOfDays && destination !== '' && destination !== '*') {
    submitBtn.attr("disabled", false);
    submitBtn.val('Book gear')
  }
  else {
    submitBtn.attr("disabled", true);
    if (destination === '' || destination === '*') {
      submitBtn.val('Vælg destination');
    }
    else {
      submitBtn.val('Vælg datoer');
    }
  }

  // Calculate Total Price
  calcbaseprice = basePrice * numberOfProducts;
  subtotalPrice = calcdays * calcbaseprice;
  subtotalPrice += calcdeposit;
  subtotalPrice += calcinsurrance;

  // Calculate Unit Price
  let bookprice = calcdays * basePrice;
  bookprice += calcdeposit;
  bookprice += calcinsurrance;

  if (!isNaN(subtotalPrice)) {
    $('#bookquantity').val(numberOfProducts);
    $('#bookprice').val(bookprice);

    if (sessionStorage.getItem('destinationName')) {
      $('#bookdestination').val(sessionStorage.getItem('destinationName'));
    } else {
      $('#bookdestination').val(destination);
    }

    // Update sub total text
    $('.current-item-price').html(prefix + subtotalPrice.toFixed(2));
  }
}

// Initial price calculation
calculatePrice();

/// Get Destination Start and end Dates based on the destination
function getDestinationDates(dest) {
  //TODO: Get dates from hidden fields from CMS?

  const minLeadTimeDays = 2; // Minimum number of days til rental starts

  let earliestStartDate = moment().add(minLeadTimeDays, 'days');
  let destinationStartDate, destinationEndDate;

  switch (dest.toLowerCase()) {
    case 'zealand':
      destinationStartDate = moment("01/04/2024", "DD/MM/YYYY");
      destinationEndDate = moment("31/10/2024", "DD/MM/YYYY");
      break;
    case 'northernjutland':
      destinationStartDate = moment("01/04/2024", "DD/MM/YYYY");
      destinationEndDate = moment("31/10/2024", "DD/MM/YYYY");
      break;
    case 'mallorca':
      destinationStartDate = moment("15/07/2024", "DD/MM/YYYY");
      destinationEndDate = moment("30/11/2024", "DD/MM/YYYY");
      break;
    case 'bornholm':
      destinationStartDate = moment("01/06/2024", "DD/MM/YYYY");
      destinationEndDate = moment("30/11/2024", "DD/MM/YYYY");
      break;
    default:
      destinationStartDate = moment("01/06/2024", "DD/MM/YYYY");
      destinationEndDate = moment("30/11/2024", "DD/MM/YYYY");
  }

  //Ensure that Start date is always at least earliest days
  destinationStartDate = moment.max(earliestStartDate, destinationStartDate).format('DD-MM-YYYY');
  destinationEndDate = destinationEndDate.format('DD-MM-YYYY');
  return {
    destinationStartDate,
    destinationEndDate
  };
}

let { destinationStartDate, destinationEndDate } = getDestinationDates(destination);

/// Date Range Picker Setup
// Config Object for DatePicker
const configObject = {
  startDate: destinationStartDate, // From Date
  endDate: destinationEndDate, // To Date
  autoClose: true,
  showTopbar: false,
  time: { enabled: false },
  format: 'DD-MM-YYYY',
  separator: ' to ',
  minDays: minNumberOfDays,
  getValue: function () {
    if ($('#startdate').val() && $('#enddate').val())
      return $('#startdate').val() + ' to ' + $('#enddate').val();
    else
      return '';
  },
  setValue: function (s, s1, s2) {
    $('#startdate').val(s1);
    $('#enddate').val(s2);
    sessionStorage.setItem('bookstartdate', s1);
    sessionStorage.setItem('bookenddate', s2);
  }
};

//TODO: Make sure to (re-)config picker on destination change
$('#dates-form').dateRangePicker(configObject).bind('datepicker-change', function (event, obj) {
  calculateDays(obj.date1, obj.date2);
});

// set dates if already selected
if (sessionStorage.getItem('bookstartdate') && sessionStorage.getItem('bookenddate')) {
  $('#startdate').val(sessionStorage.getItem('bookstartdate'));
  $('#enddate').val(sessionStorage.getItem('bookenddate'));
  calculateDays(sessionStorage.getItem('bookstartdate'), sessionStorage.getItem('bookenddate'));
}

////// DROP DOWN /////////
function dropDownFunction(name, slug) {
  // Update sessionStorage and destination variable
  sessionStorage.setItem('destination', slug);
  sessionStorage.setItem('destinationName', name);

  destination = slug;

  //TODO: Add recalculation of date range start end dates
  // Set Dropdown title to selected title
  $('#DestinationDropdownTitle').text(name);

  //Close dropdown
  $("#DestinationDropdown").trigger("w-close");
  calculatePrice();
}

//TODO: Add OnClick from code instead if in design
//TODO: Fix .ready for all initial requests
//TODO: Avoid 0.00 initial cost
//TODO: Fix dates (on destination change).
//TODO: Change back to local storage?

// Set dropdown title based on SessionStorage
if (sessionStorage.getItem('destination')) {
  $('#DestinationDropdownTitle').text(sessionStorage.getItem('destination'));
}
if (sessionStorage.getItem('destinationName')) {
  $('#DestinationDropdownTitle').text(sessionStorage.getItem('destinationName'));
}
