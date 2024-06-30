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
  const billTableBody = document.getElementById("billTableBody");
  const paginationButtons = document.getElementById("paginationButtons");
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");
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
  totalCartoonsInput.addEventListener("input", calculateTempoTotalCost);
  tempoRentalInput.addEventListener("input", calculateTempoTotalCost);
  totalCartoonsInputPickup.addEventListener("input", calculatePickupTotalCost);
  totalPetrolInput.addEventListener("input", calculatePickupTotalCost);
  tempoHaathKharchaInput.addEventListener("input", calculatePickupTotalCost);
  busTotalCostInput.addEventListener("input", calculateBusTotalCost);

  let currentPage = 1;
  let billsData = [];
  let deliveryHistory = [];
  // Event listeners
  secondaryBillBtn.addEventListener("click", function () {
    secondaryBillDetails.classList.remove("hidden");
    recordDelivery.classList.add("hidden");
    busDetails.classList.add("hidden");
    backToHome.classList.remove("hidden");
    hideMainButtons();
    showPage(currentPage);
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
    currentPage = 1;
    hidePagination();
  });

  addBillBtn.addEventListener("click", function () {
    const billNumber = billNumberInput.value.trim();
    if (billNumber !== "" && !billsData.includes(billNumber)) {
      // ! add bill to data array
      addBillToData({ billNumber: billNumber, isChecked: false });
      billNumberInput.value = "";
    } else if (billsData.includes(billNumber)) {
      alert("Bill number already exists!");
    }
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
    deliveryHistory.push({
      date: date,
      deliveryMedium: deliveryMedium,
      areas: areas,
      quantity: quantity,
      cost: cost,
      checkedBillNumbers: checkedBillNumbers,
      additionalDetails: additionalDetails,
    });

    addDeliveryToTable(
      date,
      deliveryMedium,
      areas,
      quantity,
      cost,
      checkedBillNumbers,
      additionalDetails
    );
    clearLatestBills();
  });

  function getSelectedAreas(checkboxes) {
    const selectedAreas = Array.from(checkboxes).map(
      (checkbox) => checkbox.value
    );
    return selectedAreas.join(", ");
  }

  function addDeliveryToTable(
    date,
    deliveryMedium,
    areas,
    quantity,
    cost,
    checkedBillNumbers,
    additionalDetails
  ) {
    const row = document.createElement("tr");

    // Function to format keys for display
    function formatKey(key) {
      // Replace underscores with spaces and capitalize each word
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Render additional details object into a string format
    let additionalDetailsString = "";
    if (additionalDetails) {
      additionalDetailsString = Object.entries(additionalDetails)
        .map(([key, value]) => `<strong>${formatKey(key)}:</strong> ${value}`)
        .join("<br>");
    }

    row.innerHTML = `
    <td>${checkedBillNumbers.join(", ")}</td>
    <td>${date}</td>
    <td>${deliveryMedium}</td>
    <td>${areas}</td>
    <td>${quantity}</td>
    <td>${cost}</td>
    <td>${additionalDetailsString}</td>
  `;

    deliveryTableBody.prepend(row);
    deliveryStatusTable.classList.remove("hidden");
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

  function addBillToData(billNumber) {
    billsData.push(billNumber);
    renderBillTable();
  }

  function renderBillTable() {
    billTableBody.innerHTML = "";
    // ! latest bill first
    billsData.reverse().forEach((bill, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${bill.billNumber}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            `;
      billTableBody.appendChild(row);
    });
    updatePagination();
  }

  function updatePagination() {
    if (billsData.length > 5) {
      paginationButtons.classList.remove("hidden");
    } else {
      paginationButtons.classList.add("hidden");
    }
  }

  function hidePagination() {
    paginationButtons.classList.add("hidden");
  }

  function showPage(pageNumber) {
    const startIndex = (pageNumber - 1) * 5;
    const billsToShow = billsData.slice(startIndex, startIndex + 5);
    renderBillTable(billsToShow);
  }

  billTableBody.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
      const index = event.target.getAttribute("data-index");
      billsData.splice(index, 1);
      renderBillTable();
    }
  });

  // !  changes  show secondary bill inside checkbox
  function populateLatestBills() {
    const checkboxListDiv = document.createElement("div");
    checkboxListDiv.id = "billCheckboxList";

    latestBills.innerHTML = "";

    // Create checkboxes for each bill in billsData and show only those billNumbers which are not checked
    console.log(billsData);
    billsData.forEach((bill) => {
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

  // !  changes to change bill data if any bill is used during recording a delivery
  const changeBillData = (checkedBillNumbers) => {
    billsData.forEach((bill) => {
      if (checkedBillNumbers.includes(bill.billNumber)) {
        bill.isChecked = true;
      }
    });
  };
});
