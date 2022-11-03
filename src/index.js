import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  getVideoGameData,
  getSalesByPlatform,
  getSalesByPublishers,
  getGamesByPlatform,
  getGamesByYear,
  getBestSellingGameByYear,
  getGamesOnPlatformByYear,
  getRegionalSalesByPlatform
} from "./processData";
import "./chartInitialization";
import Chart from "chart.js/auto";
import { calculateStepSize, getColor } from "./utilities";
import { CHART_CONSTANTS } from "./constants";

const createChart = (elementId, chartConfig) => {
  const context = document.getElementById(elementId).getContext("2d");
  return new Chart(context, chartConfig);
};

const initializeCharts = function () {
  let [labels, data] = getSalesByPlatform(5);

  const salesPlatformConfig = {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Sales Numbers (in millions)",
          data: data,
          backgroundColor: [
            "#118DFF",
            "#12239E",
            "#E66C37",
            "#6B007B",
            "#E044A7"
          ]
        }
      ]
    },
    options: {
      aspectRatio: 1.5,
      plugins: {
        title: {
          text: "Sales by Platform"
        },
        legend: {
          position: "right"
        },
        tooltip: {
          callbacks: {
            /**
             * Configuring custom data labels for tooltip.
             *
             * @tutorial https://www.chartjs.org/docs/latest/samples/information.html
             */
            label: function (tooltipItem) {
              return tooltipItem.formattedValue + " mn";
            }
          }
        }
      }
    }
  };

  [labels, data] = getSalesByPublishers(8);
  const stepSize = calculateStepSize(data.slice(-1), data[0], 5);
  const publisherSalesConfig = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#118DFF"]
        }
      ]
    },
    options: {
      aspectRatio: 3,
      plugins: {
        title: {
          text: "Top Selling Publishers"
        },
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Publishers"
          },
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, ticks) {
              const label = this.getLabelForValue(value);
              if (
                label.length >
                CHART_CONSTANTS.PUBLISHER_SALES_CHART.X_LABEL_MAX_LENGTH
              )
                return (
                  this.getLabelForValue(value).substr(
                    0,
                    CHART_CONSTANTS.PUBLISHER_SALES_CHART.X_LABEL_MAX_LENGTH
                  ) + "..."
                );
              return label;
            }
          }
        },
        y: {
          title: {
            display: true,
            text: "Sales (in million)"
          },
          ticks: {
            stepSize: stepSize
          }
        }
      }
    }
  };

  const platformGamesData = getGamesByPlatform(4);

  let platformGroupsArr = [];
  let platformsArr = [];
  let gamesArr = [];

  platformGamesData.forEach((data) => {
    platformGroupsArr.push(Object.keys(data)[0]);

    const platformData = Object.values(data)[0];
    platformsArr = platformsArr.concat(Object.keys(platformData));
    gamesArr = gamesArr.concat(Object.values(platformData));
  });

  const platformGamesConfig = {
    type: "bar",
    data: {
      labels: platformsArr,
      datasets: [
        {
          data: gamesArr,
          backgroundColor: ["#118DFF"]
        }
      ]
    },
    options: {
      aspectRatio: 3,
      scales: {
        x: {
          title: {
            display: true,
            text: "Platform"
          }
        },
        y: {
          title: {
            display: true,
            text: "Number of Games"
          },
          ticks: {
            stepSize: calculateStepSize(gamesArr.slice(-1), gamesArr[0], 5)
          }
        }
      },
      plugins: {
        title: {
          text: "Number of Games by Platform"
        },
        legend: {
          display: false
        }
      }
    }
  };

  const gamesByYearData = getGamesByYear(40);

  const gamesByYearConfig = {
    type: "line",
    data: {
      datasets: [
        {
          label: "Games",
          data: gamesByYearData,
          backgroundColor: ["#118DFF"],
          parsing: {
            xAxisKey: "year",
            yAxisKey: "games"
          }
        }
      ]
    },
    options: {
      aspectRatio: 3,
      /**
       * To show the data tooltip when hovering over its x axis.
       * intersect: false, shows the data tooltip even when the pointer does not intersect the data point.
       * mode: index, shows the tooltip for the item on the same index on the axis. (in this case x axis).
       */
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          text: "Games Released by Year "
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year"
          }
        },
        y: {
          title: {
            display: true,
            text: "Number of Games"
          }
        }
      }
    }
  };

  const bestSellingGamesData = getBestSellingGameByYear();

  const bestSellingGamesByYear = {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Number of Games",
          data: bestSellingGamesData,
          backgroundColor: ["#118DFF"],
          parsing: {
            xAxisKey: "year",
            yAxisKey: "game.Global_Sales"
          }
        }
      ]
    },
    options: {
      aspectRatio: 3,
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        title: {
          text: "Best Selling Games by Year"
        },
        tooltip: {
          callbacks: {
            beforeLabel: (tooltipItem) => {
              const {
                dataIndex,
                dataset: { data }
              } = tooltipItem;

              return (
                data[dataIndex].game["Name"] +
                ` (${data[dataIndex].game["Platform Group"]})`
              );
            }
          }
        }
      },
      scales: {
        x: {
          type: "category",
          title: {
            display: true,
            text: "Year"
          }
        },
        y: {
          title: {
            display: true,
            text: "Copies Sold (in million)"
          }
        }
      }
    }
  };

  const gamesOnPlatformByYearData = getGamesOnPlatformByYear([
    "Nintendo",
    "Xbox",
    "PlayStation",
    "PC"
  ]);

  let platforms = [];

  // Populate the year labels and the platforms.
  let yearLabels = gamesOnPlatformByYearData.map((item) => {
    Object.keys(item.platformGames).forEach((str) => {
      if (!platforms.includes(str)) platforms.push(str);
    });
    return item.year;
  });
  let datasets = [];

  platforms.forEach((item, index) => {
    data = {
      label: "",
      data: {},
      backgroundColor: "",
      parsing: {
        yAxisKey: ""
      }
    };
    data.label = item;
    data.data = gamesOnPlatformByYearData;
    data.backgroundColor = getColor(index);
    data.parsing.yAxisKey = "platformGames." + item;
    datasets.push(data);
  });
  const gamesOnPlatformByYearConfig = {
    type: "line",
    data: {
      // ? For some reason, using the labels here causes the data to not load.
      // ? To fix this we have added parsing of the X-axis in options.
      // labels: yearLabels,
      datasets: datasets
    },
    options: {
      aspectRatio: 3,
      interaction: {
        mode: "index",
        intersect: false
      },
      parsing: {
        xAxisKey: "year"
      },
      plugins: {
        title: {
          text: "Games on Platform by Year"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Year"
          }
        },
        y: {
          title: {
            display: true,
            text: "Copies Sold (in million)"
          }
        }
      }
    }
  };

  const regionalSalesByPlatformData = getRegionalSalesByPlatform([
    "PlayStation",
    "Nintendo",
    "Xbox",
    "PC"
  ]);
  const regions = [];

  Object.keys(regionalSalesByPlatformData[0].sales).forEach((item) => {
    regions.push(item);
  });

  let regionalSalesDatasets = regions.map((item, index) => {
    data = {
      label: "",
      data: {},
      backgroundColor: "",
      parsing: {
        yAxisKey: ""
      }
    };
    data.label = CHART_CONSTANTS.REGIONS_DISPLAY_ENUM[item];
    data.data = regionalSalesByPlatformData;
    data.backgroundColor = getColor(index);
    data.parsing.yAxisKey = "sales." + item;
    // * Without this only the first 3 data items are rendered on the bar stack.
    data.stack = "Stack 0";

    return data;
  });

  const regionalSalesByPlatformConfig = {
    type: "bar",
    data: {
      datasets: regionalSalesDatasets
    },
    options: {
      aspectRatio: 3,
      parsing: {
        xAxisKey: "platformGroup"
      },
      plugins: {
        title: {
          text: "Regional Sales by Platform"
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Platform"
          },
          stacked: true
        },
        y: {
          title: {
            display: true,
            text: "Copies Sold (in million)"
          }
        }
      }
    }
  };

  var salesPlatformChart = createChart("sales-platform", salesPlatformConfig);
  var publisherSalesChart = createChart(
    "sales-publisher",
    publisherSalesConfig
  );
  var platformGamesChart = createChart("games-platform", platformGamesConfig);
  var gamesByYearChart = createChart("games-by-year", gamesByYearConfig);
  var bestSellingGamesChart = createChart(
    "best-selling-games-by-year",
    bestSellingGamesByYear
  );
  var gamesOnPlatformByYearChart = createChart(
    "games-on-platform-by-year",
    gamesOnPlatformByYearConfig
  );
  var regionalSalesByPlatformChart = createChart(
    "regional-sales-by-platform",
    regionalSalesByPlatformConfig
  );
};

getVideoGameData(initializeCharts);
