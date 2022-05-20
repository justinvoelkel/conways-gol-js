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
  this.state = cellStates.dead
}

function Board (x, y) {
  this.height = y
  this.width = x
  this.cells = []

  this.outputBoard = () => {
    let boardPosX = 0
    let boardPosY = 0
    while (boardPosY < this.height) {
      while (boardPosX < this.width) {
        const cell = getCellByCoordinates(boardPosX, boardPosY)
        const output = cell.state ? figures.squareSmallFilled : ' '
        process.stdout.write(ansiEscapes.cursorTo(cell.x, cell.y) + output)
        boardPosX++
      }
      boardPosX = 0
      boardPosY++
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

    while (y < this.height) {
      while (x < this.width) {
        const cell = new Cell(x, y)
        if (randomizer() < 3) {
          cell.state = cellStates.live
        }
        this.cells.push(cell)
        x++
      }
      x = 0
      y++
    }
  }

  this.tick = () => {
    // run rules against all cells
    // output the board
    this.cells.forEach(cell => {
      const neighbors = getCellNeighbors(cell)
      const neighborStates = Object.values(neighbors)
        .map(neighbor => neighbor ? neighbor.state : null)
      const liveNeighbors = neighborStates.reduce((acc, state) => acc + state, 0)

      // live rules
      if (cell.state) {
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          cell.state = cellStates.dead
        }
        if (liveNeighbors === 2 || liveNeighbors === 3) {
          cell.state = cellStates.live
        }
      }

      // dead rules
      if (!cell.state) {
        if (liveNeighbors === 3) {
          cell.state = cellStates.live
        }
      }
    })
  }
}

const askQuestion = question => {
  return new Promise((resolve, reject) => {
    rline.question(question, response => {
      resolve(response)
    })
  })
}

function Game () {
  let board = null
  let numOfGenerations = 0

  this.init = async () => {
    const height = await askQuestion('board height? ')
    const width = await askQuestion('board width? ')
    numOfGenerations = await askQuestion('number of generations? ')
    rline.close()

    board = new Board(height, width)
    board.init()
  }

  this.run = () => {
    let generationCounter = 0
    while (generationCounter <= numOfGenerations) {
      board.tick()
      generationCounter++
      board.outputBoard()
    }
  }
}

const run = async () => {
  const game = new Game()
  await game.init()
  game.run()
}

run()
