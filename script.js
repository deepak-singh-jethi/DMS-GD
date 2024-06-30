document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const secondaryBillBtn = document.getElementById("secondaryBillBtn");
  const recordDeliveryBtn = document.getElementById("recordDeliveryBtn");
  const secondaryBillDetails = document.getElementById("secondaryBillDetails");
  const recordDelivery = document.getElementById("recordDelivery");
  const backToHome = document.getElementById("backToHome");
  const backHomeBtn = document.getElementById("backHomeBtn");
  const billNumberInput = document.getElementById("billNumberInput");
  const addBillBtn = document.getElementById("addBillBtn");
  const secondaryBillTable = document.getElementById("secondaryBillTable");
  const paginationButtons = document.getElementById("paginationButtons");

  const billPrevPageBtn = document.getElementById("billPrevPageBtn");
  const billNextPageBtn = document.getElementById("billNextPageBtn");

  const latestBills = document.getElementById("latestBills");
  const datepickerInput = document.getElementById("datepicker");
  const todayBtn = document.getElementById("todayBtn");
  const deliveryMediumSelect = document.getElementById("deliveryMedium");
  const tempoDetails = document.getElementById("tempoDetails");
  const pickupDetails = document.getElementById("pickupDetails");
  const busDetails = document.getElementById("busDetails");
  const tickmarkOptions = document.getElementById("tickmarkOptions");
  const pickupTickmarks = document.getElementById("pickupTickmarks");
  const totalCartoonsInput = document.getElementById("totalCartoonsInput");
  const tempoRentalInput = document.getElementById("tempoRentalInput");
  const totalCartoonsInputPickup = document.getElementById(
    "totalCartoonsInputPickup"
  );
  const totalPetrolInput = document.getElementById("totalPetrolInput");
  const tempoHaathKharchaInput = document.getElementById(
    "tempoHaathKharchaInput"
  );
  const busAreaInput = document.getElementById("busAreaInput");
  const busTotalQuantity = document.getElementById("busTotalQuantity");
  const busTotalCostInput = document.getElementById("busTotalCostInput");

  const totalCostDisplay = document.getElementById("totalCostDisplay");
  const totalCostDisplayPickup = document.getElementById(
    "totalCostDisplayPickup"
  );
  const submitDeliveryBtn = document.getElementById("submitDeliveryBtn");
  const deliveryStatusTable = document.getElementById("deliveryStatusTable");
  const deliveryTableBody = document.getElementById("deliveryTableBody");

  const recordPrevPageBtn = document.getElementById("recordPrevPageBtn");
  const recordNextPageBtn = document.getElementById("recordNextPageBtn");

  totalCartoonsInput.addEventListener("input", calculateTempoTotalCost);
  tempoRentalInput.addEventListener("input", calculateTempoTotalCost);
  totalCartoonsInputPickup.addEventListener("input", calculatePickupTotalCost);
  totalPetrolInput.addEventListener("input", calculatePickupTotalCost);
  tempoHaathKharchaInput.addEventListener("input", calculatePickupTotalCost);
  busTotalCostInput.addEventListener("input", calculateBusTotalCost);

  let currentBillPage = 1;
  let billPageSize = 5;

  let deliveryRecordPage = 1;
  let deliveryRecordPageSize = 2;

  let billsData = [];
  let deliveryHistory = [];

  // Event listeners
  secondaryBillBtn.addEventListener("click", function () {
    secondaryBillDetails.classList.remove("hidden");
    recordDelivery.classList.add("hidden");
    busDetails.classList.add("hidden");
    backToHome.classList.remove("hidden");
    hideMainButtons();
    showPageBills(currentBillPage);
  });

  recordDeliveryBtn.addEventListener("click", function () {
    recordDelivery.classList.remove("hidden");
    secondaryBillDetails.classList.add("hidden");
    busDetails.classList.add("hidden");
    backToHome.classList.remove("hidden");
    hideMainButtons();
    populateLatestBills();
  });

  backHomeBtn.addEventListener("click", function () {
    backToHome.classList.add("hidden");
    showMainButtons();
    currentBillPage = 1;
  });

  todayBtn.addEventListener("click", function () {
    const today = new Date();
    const todayFormatted = formatDate(today);
    datepickerInput.value = todayFormatted;
  });

  deliveryMediumSelect.addEventListener("change", function () {
    const selectedMedium = deliveryMediumSelect.value;
    if (selectedMedium === "tempo") {
      tempoDetails.classList.remove("hidden");
      pickupDetails.classList.add("hidden");
      busDetails.classList.add("hidden");
    } else if (selectedMedium === "pickup") {
      pickupDetails.classList.remove("hidden");
      tempoDetails.classList.add("hidden");
      busDetails.classList.add("hidden");
    } else if (selectedMedium === "bus") {
      busDetails.classList.remove("hidden");
      tempoDetails.classList.add("hidden");
      pickupDetails.classList.add("hidden");
    } else {
      tempoDetails.classList.add("hidden");
      pickupDetails.classList.add("hidden");
      busDetails.classList.add("hidden");
    }
  });

  submitDeliveryBtn.addEventListener("click", function () {
    const date = datepickerInput.value;
    const deliveryMedium = deliveryMediumSelect.value;
    let areas = "";
    let quantity = "";
    let cost = "";
    let additionalDetails = {};

    // Extract checked bill checkboxes
    const billCheckboxes = document.querySelectorAll(
      "#billCheckboxList input[type=checkbox]:checked"
    );
    const checkedBillNumbers = Array.from(billCheckboxes).map(
      (checkbox) => checkbox.value
    );

    // change bill data if any bill is used
    changeBillData(checkedBillNumbers);

    if (deliveryMedium === "tempo") {
      areas = getSelectedAreas(
        document.querySelectorAll(
          '#tickmarkOptions input[type="checkbox"]:checked'
        )
      );
      cost = totalCostDisplay.textContent;
      quantity = totalCartoonsInput.value;

      additionalDetails = {
        tempo_Rental: tempoRentalInput.value,
      };
    } else if (deliveryMedium === "pickup") {
      areas = getSelectedAreas(
        document.querySelectorAll(
          '#pickupTickmarks input[type="checkbox"]:checked'
        )
      );
      cost = totalCostDisplayPickup.textContent;
      quantity = totalCartoonsInputPickup.value;
      additionalDetails = {
        total_Petrol: totalPetrolInput.value,
        Tempo_Haath_Kharcha: tempoHaathKharchaInput.value,
      };
    } else if (deliveryMedium === "bus") {
      areas = busAreaInput.value;
      cost = busTotalCostInput.value;
      quantity = busTotalQuantity.value;
    }
    deliveryHistory.unshift({
      date,
      deliveryMedium,
      areas,
      quantity,
      cost,
      checkedBillNumbers,
      additionalDetails,
    });

    // show only first page
    showRecords(1);
    clearLatestBills();
  });

  // event listeners for pagination in record page

  recordPrevPageBtn.addEventListener("click", function () {
    if (deliveryRecordPage > 1) {
      deliveryRecordPage--;
      console.log(deliveryRecordPage);
      showRecords(deliveryRecordPage);
    }
  });

  recordNextPageBtn.addEventListener("click", function () {
    console.log("next");
    if (deliveryRecordPage * deliveryRecordPageSize < deliveryHistory.length) {
      deliveryRecordPage++;
      showRecords(deliveryRecordPage);
    }
  });

  //  showing only unchecked bill in record page
  function populateLatestBills() {
    handleRecordPaginationButtonDisplay();
    const checkboxListDiv = document.createElement("div");
    checkboxListDiv.id = "billCheckboxList";

    latestBills.innerHTML = "";

    // Create checkboxes for each bill in billsData and show only those billNumbers which are not checked

    if (billsData.length === 0) {
      latestBills.innerHTML = "<span>No bills available</span>";
      return;
    }

    // ! latest bill first

    billsData.slice(0, 5).forEach((bill) => {
      if (!bill.isChecked) {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = bill.billNumber;
        checkbox.id = `billCheckbox_${bill.billNumber}`;

        const label = document.createElement("label");
        label.textContent = bill.billNumber;
        label.setAttribute("for", `billCheckbox_${bill.billNumber}`);

        // Append checkbox and label to the checkbox list
        checkboxListDiv.appendChild(checkbox);
        checkboxListDiv.appendChild(label);
        checkboxListDiv.appendChild(document.createElement("br"));
        latestBills.appendChild(checkboxListDiv);
      }
    });
  }

  function getSelectedAreas(checkboxes) {
    const selectedAreas = Array.from(checkboxes).map(
      (checkbox) => checkbox.value
    );
    return selectedAreas.join(", ");
  }

  function clearLatestBills() {
    latestBills.innerHTML = "";
  }

  function calculateTempoTotalCost() {
    const totalCartoons = parseFloat(totalCartoonsInput.value) || 0;
    const tempoRental = parseFloat(tempoRentalInput.value) || 0;
    const totalCost = totalCartoons * 5 + tempoRental;
    totalCostDisplay.textContent = totalCost.toFixed(2);
  }

  function calculatePickupTotalCost() {
    const totalCartoonsPickup = parseFloat(totalCartoonsInputPickup.value) || 0;
    const totalPetrol = parseFloat(totalPetrolInput.value) || 0;
    const tempoHaathKharcha = parseFloat(tempoHaathKharchaInput.value) || 0;
    const totalCostPickup =
      totalCartoonsPickup * 5 + totalPetrol * 98 + tempoHaathKharcha;
    totalCostDisplayPickup.textContent = totalCostPickup.toFixed(2);
  }

  function calculateBusTotalCost() {
    const busTotalCost = parseFloat(busTotalCostInput.value) || 0;
    totalCostDisplay.textContent = busTotalCost.toFixed(2);
  }

  function showMainButtons() {
    secondaryBillBtn.classList.remove("hidden");
    recordDeliveryBtn.classList.remove("hidden");
    secondaryBillDetails.classList.add("hidden");
    recordDelivery.classList.add("hidden");
  }

  function hideMainButtons() {
    secondaryBillBtn.classList.add("hidden");
    recordDeliveryBtn.classList.add("hidden");
  }

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  // render bills
  function renderTable(deliveries) {
    const deliveryTableBody = document.getElementById("deliveryTableBody");
    deliveryTableBody.innerHTML = "";

    // Function to format keys for display
    function formatKey(key) {
      // Replace underscores with spaces and capitalize each word
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Render deliveries from deliveries array
    deliveries.forEach((element) => {
      const row = document.createElement("tr");

      let additionalDetailsString = "";

      if (element.additionalDetails) {
        additionalDetailsString = Object.entries(element.additionalDetails)
          .map(([key, value]) => `<strong>${formatKey(key)}:</strong> ${value}`)
          .join("<br>");
      }

      row.innerHTML = `
       <td>${element.checkedBillNumbers.join(", ")}</td>
      <td>${element.date}</td>
      <td>${element.deliveryMedium}</td>
      <td>${element.areas}</td>
      <td>${element.quantity}</td>
      <td>${element.cost}</td>
     
      <td>${additionalDetailsString}</td>
    `;

      deliveryTableBody.appendChild(row);
    });

    const convertExcelBtn = document.createElement("button");
    convertExcelBtn.textContent = "Convert to Excel";
    convertExcelBtn.classList.add("convert-excel-btn");

    deliveryTableBody.appendChild(convertExcelBtn);

    deliveryStatusTable.classList.remove("hidden");
  }

  const handleRecordPaginationButtonDisplay = () => {
    recordNextPageBtn.style.display =
      deliveryRecordPage * deliveryRecordPageSize < deliveryHistory.length
        ? "block"
        : "none";

    recordPrevPageBtn.style.display = deliveryRecordPage > 1 ? "block" : "none";
  };

  const showRecords = (pageNumber) => {
    const startIndex = (pageNumber - 1) * deliveryRecordPageSize;
    const endIndex = startIndex + deliveryRecordPageSize;
    const recordsToShow = deliveryHistory.slice(startIndex, endIndex);
    handleRecordPaginationButtonDisplay();
    renderTable(recordsToShow);
  };

  //
  //
  //
  //
  //
  //
  //
  //

  //* bill data function and event handlers

  addBillBtn.addEventListener("click", function () {
    const billNumber = billNumberInput.value.trim();

    if (
      billNumber !== "" &&
      !billsData.some((bill) => bill.billNumber === billNumber)
    ) {
      // If billNumber is not empty and there's no existing bill with the same number
      addBillToData({ billNumber: billNumber, isChecked: false });
      billNumberInput.value = "";
    } else {
      alert("Bill number already exists!");
    }
  });

  billNextPageBtn.addEventListener("click", () => {
    console.log({ currentBillPage });
    if (currentBillPage * billPageSize < billsData.length) {
      currentBillPage++;
      console.log(currentBillPage);
      showPageBills(currentBillPage);
    }
  });

  billPrevPageBtn.addEventListener("click", () => {
    if (currentBillPage > 1) {
      currentBillPage--;
      showPageBills(currentBillPage);
    }
  });

  // add new bill to global variable
  function addBillToData(billNumber) {
    billsData.unshift(billNumber);
    showPageBills(1);
  }

  // rendering 5 bills on display
  function renderBillTable(billsToShow) {
    secondaryBillTable.innerHTML = "";

    // ! latest bill first
    if (billsToShow === undefined || billsToShow.length === 0) {
      secondaryBillTable.innerHTML = "<span>No bills available</span>";
      return;
    }
    const thead = document.createElement("thead");
    thead.innerHTML = `
                <tr>
                    <th>Bill Number</th>
                    <th>Action</th>
                </tr>
            `;
    secondaryBillTable.appendChild(thead);

    billsToShow.forEach((bill, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${bill.billNumber}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
      secondaryBillTable.appendChild(row);
    });
  }
  // delete a bill
  secondaryBillTable.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
      const index = event.target.getAttribute("data-index");
      billsData.splice(index, 1);
      renderBillTable();
    }
  });

  // display and hide pagination buttons
  function handleBillsPaginationButtonDisplay() {
    billNextPageBtn.style.display =
      currentBillPage * billPageSize < billsData.length ? "block" : "none";

    billPrevPageBtn.style.display = currentBillPage > 1 ? "block" : "none";
  }

  // handle which bill to show
  function showPageBills(pageNumber) {
    const startIndex = (pageNumber - 1) * billPageSize;
    const billsToShow = billsData.slice(startIndex, startIndex + billPageSize);
    handleBillsPaginationButtonDisplay();
    renderBillTable(billsToShow);
  }

  // change bill data if it is already used
  const changeBillData = (checkedBillNumbers) => {
    billsData.forEach((bill) => {
      if (checkedBillNumbers.includes(bill.billNumber)) {
        bill.isChecked = true;
      }
    });
  };
});
