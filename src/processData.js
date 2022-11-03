export var videoGameData;

/**
 *
 * @param {Function} callback
 * @param  {...any} args
 */
export const getVideoGameData = async (callback, ...args) => {
  const response = await fetch("./data/vgsales.json");
  const jsonData = await response.json();

  videoGameData = jsonData;
  callback.call(...args);
};

export const getSalesByPlatform = (resultsLimit) => {
  const salesByPlatform = {};
  videoGameData.forEach((gameData) => {
    salesByPlatform[gameData["Platform Group"]] = salesByPlatform[
      gameData["Platform Group"]
    ] || { platform: gameData["Platform Group"], sales: 0 };
    salesByPlatform[gameData["Platform Group"]].sales +=
      gameData["Global_Sales"];
  });
  const labels = [];
  const sales = [];
  const salesDataArr = Object.values(salesByPlatform);
  const size = resultsLimit || salesDataArr.length;
  salesDataArr.sort((val1, val2) => {
    return val2.sales - val1.sales;
  });
  salesDataArr.slice(0, size).forEach((salesData) => {
    labels.push(salesData.platform);
    sales.push(salesData.sales);
  });

  return [labels, sales];
};

export const getSalesByPublishers = (resultsLimit) => {
  const publisherSales = {};

  videoGameData.forEach((gameData) => {
    publisherSales[gameData["Publisher"]] = publisherSales[
      gameData["Publisher"]
    ] || { publisher: gameData["Publisher"], sales: 0 };
    publisherSales[gameData["Publisher"]].sales += gameData["Global_Sales"];
  });

  const labels = [];
  const sales = [];

  const salesDataArr = Object.values(publisherSales);
  const size = resultsLimit || salesDataArr.length;
  salesDataArr.sort((val1, val2) => {
    return val2.sales - val1.sales;
  });
  salesDataArr.slice(0, size).forEach((salesData) => {
    labels.push(salesData.publisher);
    sales.push(salesData.sales);
  });

  return [labels, sales];
};

export const getGamesByPlatform = (resultsLimit) => {
  const platformGamesArr = [];

  /**
   * Created object structure is,
   *
   * [
   *  {
   *    ["Platform Group"] : {
   *      ["platform"]: "gamesCount",
   *      ["platform"]: "gamesCount",
   *      ...
   *    }
   *  }
   *  ...
   * ]
   */
  videoGameData.forEach((gameData) => {
    let platformData = platformGamesArr.find((platformObj) => {
      return platformObj[gameData["Platform Group"]] ? true : false;
    });

    if (!platformData) {
      platformData = {
        [gameData["Platform Group"]]: {}
      };
      platformGamesArr.push(platformData);
    }

    if (!platformData[gameData["Platform Group"]][gameData["Platform"]])
      platformData[gameData["Platform Group"]][gameData["Platform"]] = 0;
    platformData[gameData["Platform Group"]][gameData["Platform"]] += 1;
  });

  // Sort the array based on the total games in the platform group.
  platformGamesArr.sort((val1, val2) => {
    const sum1 = Object.values(Object.values(val1)[0]).reduce(
      (sum, val) => sum + val,
      0
    );
    const sum2 = Object.values(Object.values(val2)[0]).reduce(
      (sum, val) => sum + val,
      0
    );

    return sum2 - sum1;
  });

  const size = resultsLimit || platformGamesArr.length;
  return platformGamesArr.slice(0, size);
};

export const getGamesByYear = (resultsLimit) => {
  let gamesByYearArr = [];
  /**
   * Create object structure is,
   *
   * [
   *  {
   *    year: "",
   *    games: [],
   *  },
   *  ...
   * ]
   */
  videoGameData.forEach((gameData) => {
    // Removing non-numerical years like 'NA'.
    if (isNaN(gameData["Year"])) return;
    let data = gamesByYearArr.find((item) => item.year === gameData["Year"]);

    if (!data) {
      data = { year: gameData["Year"], games: [] };
      gamesByYearArr.push(data);
    }

    // Not adding duplicates
    if (!data.games.includes(gameData["Name"]))
      data.games.push(gameData["Name"]);
  });

  gamesByYearArr.sort((val1, val2) => {
    return val1.year - val2.year;
  });

  gamesByYearArr = gamesByYearArr.map((item) => {
    item.games = item.games.length;
    return item;
  });
  const dataLength = gamesByYearArr.length;
  const size = resultsLimit || dataLength;

  if (dataLength > size) {
    return gamesByYearArr.slice(dataLength - size, dataLength);
  }

  return gamesByYearArr;
};

export const getBestSellingGameByYear = (resultsLimit) => {
  const bestSellingGames = [];

  /**
   * The generated object structure is,
   *
   * [
   *  {
   *    year: "...",
   *    game: {}
   *  }
   * ]
   */
  videoGameData.forEach((gameData) => {
    // Removing non-numerical years like 'NA'.
    if (isNaN(gameData["Year"])) return;

    let data = bestSellingGames.find((item) => item.year === gameData["Year"]);

    if (!data) {
      data = { year: gameData["Year"], game: {} };
      bestSellingGames.push(data);
    }

    if (
      !data.game["Global_Sales"] ||
      gameData["Global_Sales"] > data.game["Global_Sales"]
    ) {
      data.game = gameData;
    }
  });

  bestSellingGames.sort((item1, item2) => {
    return item1.year - item2.year;
  });
  const dataLength = bestSellingGames.length;
  const size = resultsLimit || dataLength;

  if (dataLength > size) {
    return bestSellingGames.slice(dataLength - size, dataLength);
  }

  return bestSellingGames;
};

/**
 * Returns the games released in the year for the specified platforms.
 *
 * @param {Array} platforms
 * @param {*} resultsLimit
 */
export const getGamesOnPlatformByYear = (platforms, resultsLimit) => {
  let gamesOnPlatformByYear = [];

  /**
   * The generated object structure is,
   *
   * [
   *  {
   *    "year": "..."
   *    "platformGames": {
   *      ["Plaform Group"]: [],
   *      ...
   *    }
   *  }
   *  ...
   * ]
   */
  videoGameData.forEach((gameData) => {
    // Removing non-numerical years like 'NA'.
    if (isNaN(gameData["Year"])) return;
    // If the platform group is not present in the list, skip the game.
    if (!platforms.includes(gameData["Platform Group"])) return;

    let data = gamesOnPlatformByYear.find(
      (item) => item.year === gameData["Year"]
    );

    if (!data) {
      data = { year: gameData["Year"], platformGames: {} };
      gamesOnPlatformByYear.push(data);
    }
    if (!data.platformGames[gameData["Platform Group"]]) {
      data.platformGames[gameData["Platform Group"]] = [];
    }

    if (
      data.platformGames[gameData["Platform Group"]].includes(gameData["Name"])
    )
      return;

    data.platformGames[gameData["Platform Group"]].push(gameData["Name"]);
  });

  gamesOnPlatformByYear = gamesOnPlatformByYear.map((item) => {
    Object.keys(item.platformGames).forEach((key) => {
      item.platformGames[key] = item.platformGames[key].length;
    });
    return item;
  });

  gamesOnPlatformByYear.sort((val1, val2) => {
    return val1.year - val2.year;
  });
  const dataLength = gamesOnPlatformByYear.length;
  const size = resultsLimit || dataLength;

  if (dataLength > size) {
    return gamesOnPlatformByYear.slice(dataLength - size, dataLength);
  }

  return gamesOnPlatformByYear;
};

export const getBestSellingGameByPlatform = (platforms, resultsLimit) => {
  const bestSellingGames = [];

  /**
   * The generated object structure is,
   *
   * [
   *  {
   *    platformGroup: "",
   *    game: {}
   *  },
   *  ...
   * ]
   */
  videoGameData.forEach((gameData) => {
    let data = bestSellingGames.find(
      (item) => item.platformGroup === gameData["Platform Group"]
    );

    if (!data) {
      data = { platformGroup: gameData["Platform Group"], game: {} };
      bestSellingGames.push(data);
    }

    if (
      !data.game["Global_Sales"] ||
      data.game["Global_Sales"] < gameData["Global_Sales"]
    ) {
      data.game = gameData;
    }
  });

  bestSellingGames.sort((val1, val2) => {
    return val1.platformGroup.localeCompare(val2.platformGroup);
  });

  const size = resultsLimit || bestSellingGames.length;

  return bestSellingGames.slice(0, size);
};

export const getRegionalSalesByPlatform = (platforms = []) => {
  const regionalSales = [];

  /**
   * The generated object structure is,
   *
   * [
   *  {
   *    platformGroup: "",
   *    sales: {
   *      japan: 123,
   *      europe: 123,
   *      northAmerica: 123,
   *      others: 123
   *    }
   *  }
   * ]
   */
  videoGameData
    .filter(
      (item) =>
        platforms.length === 0 || platforms.includes(item["Platform Group"])
    )
    .forEach((gameData) => {
      let data = regionalSales.find(
        (item) => item.platformGroup === gameData["Platform Group"]
      );

      if (!data) {
        data = { platformGroup: gameData["Platform Group"], sales: {} };
        data.sales.japan = 0;
        data.sales.europe = 0;
        data.sales.northAmerica = 0;
        data.sales.others = 0;
        regionalSales.push(data);
      }

      data.sales.japan += gameData["JP_Sales"];
      data.sales.europe += gameData["EU_Sales"];
      data.sales.northAmerica += gameData["NA_Sales"];
      data.sales.others += gameData["Other_Sales"];
    });

  regionalSales.sort((val1, val2) => {
    return val1.platformGroup.localeCompare(val2.platformGroup);
  });

  return regionalSales;
};
