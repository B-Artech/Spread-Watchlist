# Equity Watchlist

Spread watchlist is commonly used by professional equity traders to generate stock ideas.
Therefore, I decided to build one using the Alpha Vantage financial market data API.

## Table of Contents

- [Equity Watchlist](#equity-watchlist)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Technologies Used](#technologies-used)
  - [Usage](#usage)
  - [Contributing](#contributing)
  - [License](#license)

## Description

The idea behind this project was to build an application that provides easy access to store equity-generated ideas in one place.
The goal is to conveniently track and monitor price action of a spread trade idea more dynamically.

What is Equity Spread:

 The concept of Equity Spread deviates from what is commonly known as spread.
 By utilizes hedging as a risk management strategy to mitigate potential losses or adverse price movements in financial investments.

  By creating a spread, we are essentially creating a completely new product, as its behavior should only be measured by the division of the two instruments involved.

## Technologies Used

- HTML
- JavaScript
- Sass

## Usage

Alpha Vantage API:

To use this watchlist, you'll need your own API key. You can obtain one for free, which provides access to the basic plan allowing up to five API requests per minute.
[Get your Alpha Vantage API KEY](https://www.alphavantage.co/support/#api-key)
Place your API Key in the fist line in JavaScript between quotes

[const apiKey = 'YOUR KEY GOES HERE'](\src\js\script.js)

Please note that if your watchlist contains more than five tickers, it may not update all of your positions with a single request. You may need to make multiple requests to ensure the update of all positions.

Breakdown of the functionality:

Please select the sector where your position is located. I have provided a list of sectors in the S&P 500 for your reference.

In the first input, please provide the ticker symbol of the stock that you want to go long on.
In the second input, provide the ticker symbol of the stock that you want to short against.

The plus button fetches stock data for the provided tickers and updates the respective input fields with the fetched prices.
It also calculates and updates the spread input field.

Add to watchlist adds a new position to the watchlist table and stores the data in localStorage.

Update prices fetches the updated stock prices for all positions in the watchlist and updates the corresponding cells in the table Last$, TDY Spread and Percent of the spread since it entered the watchlist and updates the localStorage.

Delete row button 'x'  removes a position from the watchlist table and updates the localStorage accordingly.

## Contributing

Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -am 'Add your commit message'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request describing your changes.

## License

This project is licensed under the [Bartech_Studio](\Vnotes.md)
