const apiKey = ''
const apiUrl = 'https://www.alphavantage.co/query'

const nominatorInput = document.getElementById('ticker-one')
const denominatorInput = document.getElementById('ticker-two')
const searchResults = document.getElementById('searchResults')
function fetchSearchResults(keyword, inputElement) {
	fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${apiKey}`)
		.then(response => response.json())
		.then(data => {
			const matches = data.bestMatches
			displaySearchResults(matches, inputElement)
		})
		.catch(error => {
			console.error('Error:', error)
		})
}

// Function to display search results
function displaySearchResults(matches, inputElement) {
	searchResults.innerHTML = ''

	for (let i = 0; i < matches.length; i++) {
		const result = matches[i]
		const symbol = result['1. symbol']
		const name = result['2. name']

		const listItem = document.createElement('li')
		listItem.textContent = `${symbol} - ${name}`
		listItem.addEventListener('click', () => {
			inputElement.value = symbol
			searchResults.innerHTML = ''
		})

		searchResults.appendChild(listItem)
	}
}

// Event listener for input changes
function autocompleteHandler(event) {
	const keyword = event.target.value.trim()
	const inputElement = event.target

	if (keyword.length > 0) {
		fetchSearchResults(keyword, inputElement)
	} else {
		searchResults.innerHTML = ''
	}
}

nominatorInput.addEventListener('input', autocompleteHandler)
denominatorInput.addEventListener('input', autocompleteHandler)

// Function to fetch stock data from the Alpha Vantage API
async function fetchStockData(symbol) {
	const params = new URLSearchParams({
		function: 'GLOBAL_QUOTE',
		symbol: symbol,
		apikey: apiKey,
	})

	const response = await fetch(`${apiUrl}?${params}`)
	const data = await response.json()

	if (data['Global Quote'] === undefined) {
		Swal.fire({
			icon: 'error',
			title: 'Oops...',
			text: 'Failed to fetch stock data!',
			footer: 'you might want to refresh your page',
		})
	}

	return data['Global Quote']
}

const sectorSelect = document.getElementById('sector')
const longInput = document.getElementById('long')
const shortInput = document.getElementById('short')
const dateInput = document.getElementById('entryDate')
const spreadInput = document.getElementById('spread')
const spreadEntry = document.getElementById('spreadEntry')
const percentSpread = document.getElementById('percentSpread')
const watchlistRows = document.getElementById('watchlistRows')
const addPriceBtn = document.getElementById('PriceBtn')
const watchlistBtn = document.getElementById('addToWatchlist')
const showTable = document.querySelector('table')
const updateBtn = document.getElementById('updateBtn')

addPriceBtn.addEventListener('click', addPrice)
watchlistBtn.addEventListener('click', addToWatchlist)
updateBtn.addEventListener('click', updateAllRows)

// function to add fetched prices for the server to input box
async function addPrice() {
	const longTicker = nominatorInput.value
	const shortTicker = denominatorInput.value

	if (longTicker !== '') {
		fetchStockData(longTicker).then(stockData => {
			const longPrice = parseFloat(stockData['05. price']).toFixed(2)
			longInput.value = longPrice
			calculateSpread()
		})
	}

	if (shortTicker !== '') {
		fetchStockData(shortTicker).then(stockData => {
			const shortPrice = parseFloat(stockData['05. price']).toFixed(2)
			shortInput.value = shortPrice
			calculateSpread()
		})
	}
}

// function to calculate the difference between input prices
function calculateSpread() {
	const longInput = document.getElementById('long')
	const shortInput = document.getElementById('short')

	const nominator = parseFloat(longInput.value)
	const denominator = parseFloat(shortInput.value)

	if (!isNaN(nominator) && !isNaN(denominator)) {
		const spread = nominator / denominator
		const spreadInput = document.getElementById('spread')
		spreadInput.value = spread.toFixed(2)
	}
}

nominatorInput.addEventListener('input1', addPrice)
denominatorInput.addEventListener('input2', addPrice)

//Function to add new position to watchlist table and store it in localStorage
function addToWatchlist() {
	const selectedSector = sector.value
	const nominator = nominatorInput.value.toUpperCase()
	const denominator = denominatorInput.value.toUpperCase()
	const longPrice = longInput.value
	const shortPrice = shortInput.value
	const date = dateInput.value
	const spread = spreadInput.value
	const currentSpread = spreadInput.value
	const percentSpread = ((spread - currentSpread) / currentSpread) * 100

	if (nominator && denominator && longPrice && shortPrice && spread && date) {
		const newRowData = {
			sector: selectedSector,
			nominator: nominator,
			denominator: denominator,
			longPrice: longPrice,
			shortPrice: shortPrice,
			spread: spread,
			date: date,
			percentSpread: percentSpread.toFixed(2),
		}

		let watchlistData = localStorage.getItem('watchlistData')
		if (!watchlistData) {
			watchlistData = []
		} else {
			watchlistData = JSON.parse(watchlistData)
		}

		watchlistData.push(newRowData)
		localStorage.setItem('watchlistData', JSON.stringify(watchlistData))

		const newRow = document.createElement('tr')
		const rowCount = watchlistRows.getElementsByTagName('tr').length
		newRow.innerHTML = `
    <td>${rowCount + 1}</td>
    <td>${selectedSector}</td>
    <td id="longNominator">${nominator}</td>
    <td id="shortDenominator">${denominator}</td>
    <td id="longPrice">${longPrice}</td>
    <td id="shortPrice">${shortPrice}</td>
    <td id="spreadEntry">${spread}</td>
    <td id="date">${date}</td>
    <td id="longUpdate">${longPrice}</td>
    <td id="shortUpdate">${shortPrice}</td>
    <td id="currentSpread">${spread}</td>
    <td id="percentSpread">${percentSpread}%</td>
    <td><button onclick="removeRow(this)">x</button></td>
    `

		watchlistRows.appendChild(newRow)

		sectorSelect.value = ''
		nominatorInput.value = ''
		denominatorInput.value = ''
		longInput.value = ''
		shortInput.value = ''
		spreadInput.value = ''
		dateInput.value = ''
	}
}

//Function to fetch stock prices form server and update in your watchlist

function updateAllRows() {
	const rows = watchlistRows.querySelectorAll('tr')
	const promises = []

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]
		const nominatorCell = row.querySelector('#longNominator')
		const denominatorCell = row.querySelector('#shortDenominator')
		const longUpdateCell = row.querySelector('#longUpdate')
		const shortUpdateCell = row.querySelector('#shortUpdate')
		const currentSpreadCell = row.querySelector('#currentSpread')

		const nominator = nominatorCell.textContent.toUpperCase()
		const denominator = denominatorCell.textContent.toUpperCase()

		const nominatorPromise = fetchStockData(nominator).then(priceLong => {
			const longPriceUpdate = parseFloat(priceLong['05. price'])
			longUpdateCell.textContent = longPriceUpdate.toFixed(2)
			updateLocalStorageValue(i, 'longUpdate', longPriceUpdate.toFixed(2))
			return longPriceUpdate
		})

		const denominatorPromise = fetchStockData(denominator).then(priceShort => {
			const shortPriceUpdate = parseFloat(priceShort['05. price'])
			shortUpdateCell.textContent = shortPriceUpdate.toFixed(2)
			updateLocalStorageValue(i, 'shortUpdate', shortPriceUpdate.toFixed(2))
			return shortPriceUpdate
		})

		const spreadEntry = parseFloat(row.querySelector('#spreadEntry').textContent)
		const spreadPromise = Promise.all([nominatorPromise, denominatorPromise]).then(([longPrice, shortPrice]) => {
			if (!isNaN(longPrice) && !isNaN(shortPrice)) {
				const updateSpread = longPrice / shortPrice
				currentSpreadCell.textContent = updateSpread.toFixed(2)
				const currentSpread = parseFloat(currentSpreadCell.textContent)
				const percentDifference = ((currentSpread - spreadEntry) / spreadEntry) * 100
				const roundedPercentage = Math.fround(percentDifference).toFixed(2)

				currentSpreadCell.textContent = updateSpread.toFixed(2)
				const percentSpreadCell = row.querySelector('#percentSpread')
				row.querySelector('#percentSpread').textContent = `${roundedPercentage}%`

				if (percentDifference > 0) {
					percentSpreadCell.style.color = 'lime'
				} else {
					percentSpreadCell.style.color = 'red'
				}
				updateLocalStorageValue(i, 'currentSpread', updateSpread.toFixed(2))
				updateLocalStorageValue(i, 'percentSpread', `${roundedPercentage}%`)
			}
		})

		promises.push(nominatorPromise, denominatorPromise, spreadPromise)
	}

	Promise.all(promises).then(() => {
		Swal.fire({
			icon: 'success',
			title: 'OK !',
			text: 'Data update success',
		})
	})
}

function updateLocalStorageValue(rowIndex, property, value) {
	let watchlistData = localStorage.getItem('watchlistData')
	if (!watchlistData) {
		return
	}

	watchlistData = JSON.parse(watchlistData)
	if (rowIndex >= 0 && rowIndex < watchlistData.length) {
		watchlistData[rowIndex][property] = value
		localStorage.setItem('watchlistData', JSON.stringify(watchlistData))
	}
}

// Function to remove individual position from watchlist table and update your localStorage
function removeRow(button) {
	const row = button.closest('tr')
	const table = row.parentNode
	row.remove()

	const rows = table.getElementsByTagName('tr')
	for (let i = 1; i < rows.length; i++) {
		const row = rows[i]
		const numberCell = row.cells[0]
		numberCell.textContent = i.toString()
	}

	const rowNumber = parseInt(row.cells[0].textContent)
	let watchlistData = localStorage.getItem('watchlistData')
	if (watchlistData) {
		watchlistData = JSON.parse(watchlistData)
		watchlistData.splice(rowNumber - 1, 1)
		localStorage.setItem('watchlistData', JSON.stringify(watchlistData))
	}

	removeButton.addEventListener('click', function () {
		removeRow(this)
	})
}

//Loading current state of position from localStorage

window.addEventListener('load', () => {
	let watchlistData = localStorage.getItem('watchlistData')
	if (watchlistData) {
		watchlistData = JSON.parse(watchlistData)

		for (const rowData of watchlistData) {
			const newRow = document.createElement('tr')
			const rowCount = watchlistRows.getElementsByTagName('tr').length
			newRow.innerHTML = `
		  <td>${rowCount + 1}</td>
		  <td>${rowData.sector}</td>
		  <td id="longNominator">${rowData.nominator}</td>
		  <td id="shortDenominator">${rowData.denominator}</td>
		  <td id="longPrice">${rowData.longPrice}</td>
		  <td id="shortPrice">${rowData.shortPrice}</td>
		  <td id="spreadEntry">${rowData.spread}</td>
		  <td id="date">${rowData.date}</td>
		  <td id="longUpdate">${rowData.longUpdate}</td>
		  <td id="shortUpdate">${rowData.shortUpdate}</td>
		  <td id="currentSpread">${rowData.currentSpread}</td>
		  <td id="percentSpread">${rowData.percentSpread}</td>
		  <td><button onclick="removeRow(this)">x</button></td>
		`
			watchlistRows.appendChild(newRow)
		}
	}
})
