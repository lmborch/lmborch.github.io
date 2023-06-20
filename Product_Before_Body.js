    debugger;
    const prefix = '€&nbsp;' // Currency prefix
    let minNumberOfDays = 1;     // Mininium number of rental days

    // Get initial rental price
    let basePrice = $('.current-item-price').text();
    basePrice = Number(basePrice.replace(/[^0-9.-]+/g, "")) / 100;

    let subtotalPrice = 0;

    // Get QTY ordered
    let numberOfProducts = Number($('.w-commerce-commerceaddtocartquantityinput').val())

    // Get Insurance Price and deposit price
    let insurranceprice = Number($('.insurranceprice').text())
    let depositprice = Number($('.depositprice').text())
    let calcinsurrance = insurranceprice
    let calcdeposit = depositprice

    // Set Deposit to zero if invisible
    if ($('.depositprice').hasClass('w-condition-invisible')) {
        calcdeposit = 0
    }
    // Set Insurance to zero if invisible
    if ($('.insurranceprice').hasClass('w-condition-invisible')) {
        calcinsurrance = 0
    }

    let calcdays = 0
    let calcbaseprice = Number(basePrice * numberOfProducts)

    var submitBtn = $(".add-to-cart-button");
    submitBtn.attr("disabled", true);
    submitBtn.css("display", 'inline-block');

    // should already be on the page
    let destination = ''

    if (localStorage.getItem('destination')) {
        destination = localStorage.getItem('destination')
    }



    // Calculate days and price
    const calculateDays = (date1, date2) => {

        var Difference_In_Time = moment(date2, "DD/MM/YYYY").toDate().getTime() - moment(date1, "DD/MM/YYYY").toDate().getTime();
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);


        // Calculate date difference (exampel Fre-lør er kun 1 dag.)  Men samme dag (hvis overhovede mulgit), skal stadig koste 1 dag.
        calcdays = Math.max(Difference_In_Days, 1);
        
        $('#bookstartdate').val(moment(date1, "DD/MM/YYYY").format('DD-MM-YYYY'));
        $('#bookenddate').val(moment(date2, "DD/MM/YYYY").format('DD-MM-YYYY'));
        calculatePrice();

        if (!isNaN(calcdays)) {
            $('#booknumberofdays').val(calcdays + ' days');
            $('#TotalRentalCostLabel').text('Total (' + calcdays + ' days)');
        }
    }

    // On Click event
    $('#addinsurrancebtn').click(
        function () {
            calcinsurrance = this.checked ? insurranceprice : 0;
            calculatePrice();
        }
    )

    $('.w-commerce-commerceaddtocartquantityinput').change(
        function () {
            numberOfProducts = Number($(this).val());
            console.log('.w - commerce - commerceaddtocartquantityinput ' + numberOfProducts);
            calculatePrice();
        }
    )
    $(".quantity-input button").on("click",
        function () {
            numberOfProducts = Number($(".w-commerce-commerceaddtocartquantityinput").val())
            calculatePrice();
        });

    // If variant exists
    if ($(".variantinput").length > 0) {
        $(".variantinput").on("change",
            function () {
                basePrice = $('.current-item-price').text();
                basePrice = Number(basePrice.replace(/[^0-9.-]+/g, "")) / 100;
                calculatePrice();
            }
        );
    }

    const calculatePrice = () => {

        // activate submit button if min. number of days is met and destination is selected
        if (calcdays >= minNumberOfDays && destination != '' && destination != '*') {
            submitBtn.attr("disabled", false);
            submitBtn.val('Rent Gear')
        }
        else {
            submitBtn.attr("disabled", true);
            if (destination == '' || destination == '*') {
                submitBtn.val('Please select destination');
            }
            else {
                submitBtn.val('Please select dates');
            }
        }

        // Calculate Total Price
        calcbaseprice = Number(basePrice * numberOfProducts);
        subtotalPrice = Number(calcdays * calcbaseprice);
        subtotalPrice = Number(subtotalPrice + calcdeposit);
        subtotalPrice = Number(subtotalPrice + calcinsurrance);

        // Calculate Unit Price
        let bookprice = Number(calcdays * basePrice);
        bookprice = Number(bookprice + calcdeposit);
        bookprice = Number(bookprice + calcinsurrance);

        if (!isNaN(subtotalPrice)) {

            $('#bookquantity').val(numberOfProducts);
            $('#bookprice').val(bookprice);

            if (localStorage.getItem('destinationName')) {
                $('#bookdestination').val(localStorage.getItem('destinationName'));
            }
            else {
                $('#bookdestination').val(destination);
            }

            // update sub total text
            $('.current-item-price').html(prefix + Number(subtotalPrice).toFixed(2));
        }
    }

    // Init
    calculatePrice();

    /// Get Destination Start and end Dates based on the destination
    function getDestinationDates(dest) {
        //TODO: Get dates from hidden fields from CMS?

        let tomorrow = moment().add(1, 'days');
        let destinationStartDate, destinationEndDate;

        switch (dest.toLowerCase()) {
            case 'zealand':
                destinationStartDate = moment("01/04/2023", "DD/MM/YYYY");
                destinationEndDate = moment("31/10/2023", "DD/MM/YYYY");
                break;
            case 'northernjutland':
                destinationStartDate = moment("01/04/2023", "DD/MM/YYYY");
                destinationEndDate = moment("31/10/2023", "DD/MM/YYYY");
                break;
            case 'mallorca':
                destinationStartDate = moment("15/07/2023", "DD/MM/YYYY");
                destinationEndDate = moment("17/09/2023", "DD/MM/YYYY");
                break;
            case 'bornholm':
                destinationStartDate = moment("01/06/2023", "DD/MM/YYYY");
                destinationEndDate = moment("30/09/2023", "DD/MM/YYYY");
                break;
            default:
                destinationStartDate = tomorrow;
                destinationEndDate = tomorrow.add(6, 'M');
        }

        //Ensure that Start date is always at least tomorrow
        destinationStartDate = moment.max(tomorrow, destinationStartDate).format('DD-MM-YYYY');
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
            localStorage.setItem('bookstartdate', s1);
            localStorage.setItem('bookenddate', s2);
        }
    }

    $('#dates-form').dateRangePicker(configObject).bind('datepicker-change',
        function (event, obj) {
            calculateDays(obj.date1, obj.date2);
        }
    )

    // set dates if already selected
    if (localStorage.getItem('bookstartdate') && localStorage.getItem('bookenddate')) {
        $('#startdate').val(localStorage.getItem('bookstartdate'));
        $('#enddate').val(localStorage.getItem('bookenddate'));
        calculateDays(localStorage.getItem('bookstartdate'), localStorage.getItem('bookenddate'));
    }

    ////// DROP DOWN /////////
    function dropDownFunction(name, slug) {
        // Update localStorage and destionation variable
        localStorage.setItem('destination', slug);
        localStorage.setItem('destinationName', name);

        destination = slug;

        // Set Dropdown title to selected title
        $('#DestinationDropdownTitle').text(name);

        //Close dropdown
        $("#DestinationDropdown").trigger("w-close");
        calculatePrice();
    }

    //TODO: Add OnClik from code instead if in design
    //TODO: Fix .ready for all initial requests
    //Done: Save dates for init later
    //TODO: Avoid 0.00inital cost
    //TODO: FIx dates (on destiantion change).

    jQuery(document).ready(
        // Set dropdown title based on local storage
        function ($) {
            if (localStorage.getItem('destination')) {
                $('#DestinationDropdownTitle').text(localStorage.getItem('destination'));
            }
            if (localStorage.getItem('destinationName')) {
                $('#DestinationDropdownTitle').text(localStorage.getItem('destinationName'));
            }
        }
    );