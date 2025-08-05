    const numberData = [
      { number: 0, size: "Small", color: "Violet🔴🟣" },
      { number: 1, size: "Small", color: "Green🟢" },
      { number: 2, size: "Small", color: "Red🔴" },
      { number: 3, size: "Small", color: "Green🟢" },
      { number: 4, size: "Small", color: "Red🔴" },
      { number: 5, size: "Big", color: "Violet🟢🟣" },
      { number: 6, size: "Big", color: "Red🔴" },
      { number: 7, size: "Big", color: "Green🟢" },
      { number: 8, size: "Big", color: "Red🔴" },
      { number: 9, size: "Big", color: "Green🟢" }
    ];

    function predict(periodNumber) {
      const n = Math.floor(Math.random() * 10);
      const pred = numberData[n];
      const predictedSingle = `${pred.number} ${pred.size} ${pred.color}`;

     document.getElementById("predictedResult").textContent = predictedSingle;

      const row = `
        <tr>
          <td>${periodNumber}</td>
          <td>${pred.number}</td>
          <td>${pred.color}</td>
          <td>${pred.color}</td>
        </tr>
      `;
      document.getElementById("predictionTable").insertAdjacentHTML('afterbegin', row);
    }

    function manualPrediction() {
      const input = document.getElementById("manualPeriod").value;
      if (!input) {
        alert("Please enter a valid period number.");
        return;
      }
      predict(parseInt(input));
    }