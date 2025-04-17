window.addEventListener("DOMContentLoaded", () => {
  const productiveSites = ["leetcode.com", "github.com", "stackoverflow.com"];
  const unproductiveSites = ["facebook.com", "instagram.com", "youtube.com"];

  chrome.storage.local.get(null, (data) => {
    if (!data || Object.keys(data).length === 0) {
      alert("No time tracking data found.");
      return;
    }

    const labels = [];
    const values = [];
    let productive = 0;
    let unproductive = 0;

    for (let domain in data) {
      const seconds = data[domain];
      labels.push(domain);
      values.push(seconds);

      if (productiveSites.includes(domain)) productive += seconds;
      else if (unproductiveSites.includes(domain)) unproductive += seconds;
    }

    const totalTime = productive + unproductive;
    const productivePercent = totalTime > 0 ? ((productive / totalTime) * 100).toFixed(1) : 0;

    const ctx = document.getElementById("timeChart").getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Time Spent (seconds)",
          data: values,
          backgroundColor: labels.map(domain =>
            productiveSites.includes(domain) ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
          ),
          borderColor: labels.map(domain =>
            productiveSites.includes(domain) ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)"
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Website Usage Summary"
          },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    const summary = document.createElement("div");
    summary.innerHTML = `
      <p><strong>Total Time:</strong> ${totalTime}s</p>
      <p><strong>Productive Time:</strong> ${productive}s</p>
      <p><strong>Unproductive Time:</strong> ${unproductive}s</p>
      <p><strong>Productivity Score:</strong> ${productivePercent}%</p>
    `;
    document.body.appendChild(summary);
  });
});