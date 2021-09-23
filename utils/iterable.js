class Generator {
  constructor() {
    this.value = 0
  }

  get() {
    return this.value
  }

  getNext() {
    this.value += 1
    return this.value
  }

  skip(n = 1) {
    this.value += n
  }
}

const arrayMultiply = (arr, n) => {
  const res = []

  for (let i = 0; i < n; i += 1) {
    res.push(...arr)
  }

  return res
}

module.exports = {
  Generator,
  arrayMultiply,
}
