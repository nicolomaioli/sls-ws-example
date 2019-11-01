'use strict'

module.exports = () => {
  const races = [
    'Dragonborn',
    'Dwarf',
    'Elf',
    'Gnome',
    'Goblin',
    'HalfElf',
    'Halfling',
    'HalfOrc',
    'Human',
    'Tiefling'
  ]

  const classes = [
    'Barbarian',
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

  const randomRace = races[Math.floor(Math.random() * (races.length))]
  const randomClass = classes[Math.floor(Math.random() * (classes.length))]
  const randomNumber = 60 + Math.floor(Math.random() * (40))

  return `${randomRace}${randomClass}${randomNumber}`
}
