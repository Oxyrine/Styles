// Curated pools. Difficulty = how well known the songs are.
// Titles are matched against the iTunes catalogue, so keep them as the store spells them.
export const TRACKS = [
  { id: 'pop', name: 'Pop Hits', genre: 'Pop', difficulty: 'easy', songs: [
    ['Blinding Lights', 'The Weeknd'], ['Shape of You', 'Ed Sheeran'], ['bad guy', 'Billie Eilish'],
    ['Levitating', 'Dua Lipa'], ['Shake It Off', 'Taylor Swift'], ['Uptown Funk', 'Mark Ronson'],
    ['Rolling in the Deep', 'Adele'], ['Happy', 'Pharrell Williams'], ['Firework', 'Katy Perry'],
    ['STAY', 'The Kid LAROI'], ['Dance Monkey', 'Tones and I'], ['Someone Like You', 'Adele'],
    ['Peaches', 'Justin Bieber'], ['As It Was', 'Harry Styles'], ['Flowers', 'Miley Cyrus'],
    ['Cruel Summer', 'Taylor Swift'], ['Bad Romance', 'Lady Gaga'], ['Roar', 'Katy Perry'],
  ]},
  { id: 'bollywood', name: 'Bollywood Blockbusters', genre: 'Bollywood', difficulty: 'easy', songs: [
    ['Tum Hi Ho', 'Arijit Singh'], ['Kala Chashma', 'Badshah'], ['Chaiyya Chaiyya', 'Sukhwinder Singh'],
    ['Kal Ho Naa Ho', 'Sonu Nigam'], ['Kabira', 'Tochi Raina'], ['Gerua', 'Arijit Singh'],
    ['Channa Mereya', 'Arijit Singh'], ['Badtameez Dil', 'Benny Dayal'], ['Ghungroo', 'Arijit Singh'],
    ['Apna Time Aayega', 'Ranveer Singh'], ['Kesariya', 'Arijit Singh'], ['Jai Ho', 'A. R. Rahman'],
    ['Zinda', 'Siddharth Mahadevan'], ['Senorita', 'Farhan Akhtar'], ['Dil Diyan Gallan', 'Atif Aslam'],
    ['Kar Gayi Chull', 'Badshah'], ['Raabta', 'Arijit Singh'], ['Ae Dil Hai Mushkil', 'Arijit Singh'],
  ]},
  { id: 'rock', name: 'Rock Classics', genre: 'Rock', difficulty: 'medium', songs: [
    ['Bohemian Rhapsody', 'Queen'], ['Hotel California', 'Eagles'], ["Sweet Child O' Mine", "Guns N' Roses"],
    ['Smells Like Teen Spirit', 'Nirvana'], ['Back In Black', 'AC/DC'], ['Stairway to Heaven', 'Led Zeppelin'],
    ["Don't Stop Believin'", 'Journey'], ["Livin' on a Prayer", 'Bon Jovi'], ['Crazy Train', 'Ozzy Osbourne'],
    ['Wish You Were Here', 'Pink Floyd'], ['Under the Bridge', 'Red Hot Chili Peppers'], ['Enter Sandman', 'Metallica'],
    ['Paint It Black', 'The Rolling Stones'], ['Purple Haze', 'Jimi Hendrix'], ['Born to Run', 'Bruce Springsteen'],
    ['With or Without You', 'U2'], ['Black Dog', 'Led Zeppelin'], ['Whole Lotta Love', 'Led Zeppelin'],
  ]},
  { id: 'hiphop', name: 'Hip-Hop', genre: 'Hip-Hop', difficulty: 'medium', songs: [
    ['Lose Yourself', 'Eminem'], ['SICKO MODE', 'Travis Scott'], ['HUMBLE.', 'Kendrick Lamar'],
    ['In Da Club', '50 Cent'], ['Juicy', 'The Notorious B.I.G.'], ['Empire State of Mind', 'JAY-Z'],
    ["God's Plan", 'Drake'], ['Gold Digger', 'Kanye West'], ['Hotline Bling', 'Drake'],
    ['Stan', 'Eminem'], ['California Love', '2Pac'], ['Mask Off', 'Future'],
    ['Alright', 'Kendrick Lamar'], ['rockstar', 'Post Malone'], ['Lucid Dreams', 'Juice WRLD'],
    ['Money Trees', 'Kendrick Lamar'], ['Still D.R.E.', 'Dr. Dre'], ['Mo Bamba', 'Sheck Wes'],
  ]},
  { id: '2000s', name: '2000s Throwbacks', genre: '2000s', difficulty: 'medium', songs: [
    ['Mr. Brightside', 'The Killers'], ['Crazy in Love', 'Beyoncé'], ['Hey Ya!', 'OutKast'],
    ['Umbrella', 'Rihanna'], ['Yeah!', 'Usher'], ['Toxic', 'Britney Spears'],
    ['Seven Nation Army', 'The White Stripes'], ['Boulevard of Broken Dreams', 'Green Day'], ["Hips Don't Lie", 'Shakira'],
    ['Complicated', 'Avril Lavigne'], ['Clocks', 'Coldplay'], ['Since U Been Gone', 'Kelly Clarkson'],
    ['Lose Control', 'Missy Elliott'], ['American Idiot', 'Green Day'], ['Float On', 'Modest Mouse'],
    ['Take Me Out', 'Franz Ferdinand'], ['Dani California', 'Red Hot Chili Peppers'], ['Bring Me to Life', 'Evanescence'],
  ]},
  { id: 'indie', name: 'Indie & Alt Deep Cuts', genre: 'Indie', difficulty: 'hard', songs: [
    ['Do I Wanna Know?', 'Arctic Monkeys'], ['Electric Feel', 'MGMT'], ['Pumped Up Kicks', 'Foster The People'],
    ['Kids', 'MGMT'], ['Skinny Love', 'Bon Iver'], ['Ho Hey', 'The Lumineers'],
    ['Little Talks', 'Of Monsters and Men'], ['Such Great Heights', 'The Postal Service'], ['Cigarette Daydreams', 'Cage The Elephant'],
    ['Heat Waves', 'Glass Animals'], ['Take Me to Church', 'Hozier'], ['Reptilia', 'The Strokes'],
    ['Last Nite', 'The Strokes'], ['Sleepyhead', 'Passion Pit'], ['Dog Days Are Over', 'Florence + The Machine'],
    ['Ain\'t No Rest for the Wicked', 'Cage The Elephant'], ['Tongue Tied', 'Grouplove'], ['Myth', 'Beach House'],
  ]},
  { id: 'electronic', name: 'Electronic', genre: 'Electronic', difficulty: 'hard', songs: [
    ['Around the World', 'Daft Punk'], ['One More Time', 'Daft Punk'], ['Strobe', 'deadmau5'],
    ['Titanium', 'David Guetta'], ['Levels', 'Avicii'], ['Wake Me Up', 'Avicii'],
    ['Clarity', 'Zedd'], ['Scary Monsters and Nice Sprites', 'Skrillex'], ['Animals', 'Martin Garrix'],
    ["Don't You Worry Child", 'Swedish House Mafia'], ['Sandstorm', 'Darude'], ['Firestone', 'Kygo'],
    ['Lean On', 'Major Lazer'], ['Satisfaction', 'Benny Benassi'], ['Language', 'Porter Robinson'],
    ['Opus', 'Eric Prydz'], ['Greyhound', 'Swedish House Mafia'], ['Alone', 'Marshmello'],
  ]},
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
