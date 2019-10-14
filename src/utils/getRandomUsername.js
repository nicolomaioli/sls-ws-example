const getRandomDigit = () => {
  return Math.floor(Math.random() * 10)
}

exports.getRandomUsername = () => {
  const races = [
    'Dragonborn',
    'Dwarf',
    'Elf',
    'Gnome',
    'HalfElf',
    'Halfling',
    'HalfOrc',
    'Human',
    'Tiefling'
  ]

  const classes = [
    'Barbiarian',
    'Bard',
    'Cleric',
    'Druid',
    'Fighter',
    'Monk',
    'Paladin',
    'Ranger',
    'Rogue',
    'Sorcerer',
    'Warlock',
    'Wizard'
  ]

  const randomRace = races[Math.floor(Math.random() * races.length)]
  const randomClass = classes[Math.floor(Math.random() * classes.length)]

  let username = `${randomRace}${randomClass}`
  const threeTimes = [...Array(3)]

  threeTimes.forEach(_ => {
    username += getRandomDigit()
  })

  return username
}
