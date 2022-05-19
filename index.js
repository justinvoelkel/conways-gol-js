import ansiEscapes from 'ansi-escapes'
import readline from 'readline'
import figures from 'figures'

const rline = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const cellStates = Object.freeze({
  dead: 0,
  live: 1
})

function Cell (x, y) {
  this.x = x
  this.y = y
  let state = cellStates.dead

  this.setState = s => state = s
  this.getState = () => state

  this.outputCellState = () => {
    const output = state ? figures.squareSmallFilled : ' '
    process.stdout.write(ansiEscapes.cursorTo(this.x, this.y) + output)
  }
}

function Board (x, y) {
  this.height = x
  this.width = y
  this.cells = []

  const outputBoard = () => {
    // console.log('output state of the board to stdout')
    let x = 0
    let y = 0
    while (x < this.height) {
      while (y < this.width) {
        const cell = getCellByCoordinates(x, y)
        cell.outputCellState()
        y++
      }
      y = 0
      x++
    }
  }

  const getCellByCoordinates = (x, y) => {
    return this.cells.find(cell => cell.x === x && cell.y === y)
  }

  const getCellNeighbors = (cell) => {
    const east = getCellByCoordinates(cell.x + 1, cell.y)
    const west = getCellByCoordinates(cell.x - 1, cell.y)
    const north = getCellByCoordinates(cell.x, cell.y + 1)
    const south = getCellByCoordinates(cell.x, cell.y - 1)

    const northWest = north ? getCellByCoordinates(north.x - 1, north.y) : null
    const northEast = north ? getCellByCoordinates(north.x + 1, north.y) : null
    const southWest = south ? getCellByCoordinates(south.x - 1, south.y) : null
    const southEast = south ? getCellByCoordinates(south.x + 1, south.y) : null

    return {
      north,
      east,
      south,
      west,
      northEast,
      southEast,
      northWest,
      southWest
    }
  }

  this.init = () => {
    let x = 0
    let y = 0

    // randomly seed some live cells
    const randomizer = () => Math.random() * (10 - 0) + 0

    while (x < this.height) {
      while (y < this.width) {
        const cell = new Cell(x, y)
        if (randomizer() < 3) {
          cell.setState(cellStates.live)
        }
        this.cells.push(cell)
        y++
      }
      y = 0
      x++
    }
  }

  this.tick = () => {
    // run rules against all cells
    // output the board
    this.cells.forEach(cell => {
      const neighbors = getCellNeighbors(cell)
      const neighborStates = Object.values(neighbors)
        .map(neighbor => neighbor ? neighbor.getState() : null)
      const liveNeighbors = neighborStates.reduce((acc, state) => acc + state, 0)

      // live rules
      if (cell.getState()) {
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          cell.setState(cellStates.dead)
        }
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          cell.setState(cellStates.live)
        }
      }

      // dead rules
      if (!cell.getState()) {
        if (liveNeighbors === 3) {
          cell.setState(cellStates.live)
        }
      }
    })
    outputBoard()
  }
}

const askQuestion = question => {
  return new Promise((resolve, reject) => {
    rline.question(question, response => {
      resolve(response)
    })
  })
}

const initGame = async () => {
  const height = await askQuestion('board height? ')
  const width = await askQuestion('board width? ')
  const generations = await askQuestion('number of generations? ')
  rline.close()

  const board = new Board(height, width)
  board.init()

  let generationCounter = 0
  while (generationCounter <= generations) {
    board.tick()
    generationCounter++
  }
}

initGame()
