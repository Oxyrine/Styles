// Tracks are lists of artists, not songs: every round draws from that artist's whole iTunes catalogue.
// Difficulty is how deep into an artist's catalogue we dip (see DEPTH in game.js) and how mainstream the artists are.
export const TRACKS = [
  { id: 'pop', name: 'Pop Hits', genre: 'Pop', difficulty: 'easy', artists: [
    'Taylor Swift', 'Ed Sheeran', 'Adele', 'Dua Lipa', 'Ariana Grande', 'Justin Bieber', 'Katy Perry', 'Bruno Mars',
    'Billie Eilish', 'The Weeknd', 'Harry Styles', 'Rihanna', 'Lady Gaga', 'Shawn Mendes', 'Miley Cyrus', 'Selena Gomez',
    'Olivia Rodrigo', 'Sia', 'Charlie Puth', 'Sabrina Carpenter', 'Britney Spears', 'Beyoncé', 'Camila Cabello', 'Demi Lovato', 'Lizzo',
  ]},
  { id: 'bollywood', name: 'Bollywood Blockbusters', genre: 'Bollywood', difficulty: 'easy', artists: [
    'Arijit Singh', 'Atif Aslam', 'Shreya Ghoshal', 'Sonu Nigam', 'Badshah', 'Neha Kakkar', 'A. R. Rahman', 'Kishore Kumar',
    'Lata Mangeshkar', 'Armaan Malik', 'Jubin Nautiyal', 'Sunidhi Chauhan', 'Yo Yo Honey Singh', 'Pritam',
    'Shankar-Ehsaan-Loy', 'Diljit Dosanjh', 'Darshan Raval', 'B Praak', 'Kumar Sanu', 'Udit Narayan', 'Alka Yagnik', 'Mika Singh', 'Sachin-Jigar',
  ]},
  { id: 'rock', name: 'Rock Classics', genre: 'Rock', difficulty: 'medium', artists: [
    'Queen', 'Led Zeppelin', 'Pink Floyd', 'The Beatles', 'The Rolling Stones', 'AC/DC', 'Nirvana', "Guns N' Roses", 'Metallica',
    'Aerosmith', 'U2', 'Foo Fighters', 'Red Hot Chili Peppers', 'Eagles', 'Bon Jovi', 'Fleetwood Mac', 'Deep Purple', 'The Who',
    'Black Sabbath', 'Van Halen', 'Green Day', 'Radiohead', 'Linkin Park', 'Pearl Jam', 'The Doors', 'Dire Straits',
    'Creedence Clearwater Revival', 'Def Leppard',
  ]},
  { id: 'hiphop', name: 'Hip-Hop', genre: 'Hip-Hop', difficulty: 'medium', artists: [
    'Eminem', 'Kendrick Lamar', 'Drake', 'Kanye West', 'JAY-Z', '50 Cent', 'Travis Scott', 'Post Malone', 'Nas', 'Snoop Dogg',
    'Dr. Dre', '2Pac', 'The Notorious B.I.G.', 'J. Cole', 'Lil Wayne', 'Cardi B', 'Nicki Minaj', 'Tyler, The Creator',
    'OutKast', 'Run-D.M.C.', 'Wu-Tang Clan', 'Juice WRLD', 'Lil Uzi Vert', 'Migos', 'Megan Thee Stallion', 'Ice Cube', 'Public Enemy',
  ]},
  { id: '2000s', name: '2000s Throwbacks', genre: '2000s', difficulty: 'medium', artists: [
    'Britney Spears', 'Usher', 'OutKast', 'The Killers', 'Green Day', 'Avril Lavigne', 'Kelly Clarkson', 'Black Eyed Peas',
    'Maroon 5', 'Coldplay', 'Shakira', 'Linkin Park', 'Evanescence', 'Nelly', 'Gwen Stefani', "Destiny's Child", 'Christina Aguilera',
    '*NSYNC', 'Backstreet Boys', 'Fall Out Boy', 'My Chemical Romance', 'Panic! At the Disco', 'The White Stripes', 'Franz Ferdinand',
    'Justin Timberlake', 'Akon', 'Sean Paul', 'Missy Elliott', 'Alicia Keys',
  ]},
  { id: 'indie', name: 'Indie & Alt Deep Cuts', genre: 'Indie', difficulty: 'hard', artists: [
    'Arctic Monkeys', 'MGMT', 'Foster The People', 'Bon Iver', 'The Lumineers', 'Of Monsters and Men', 'The Postal Service',
    'Cage The Elephant', 'Glass Animals', 'Hozier', 'The Strokes', 'Passion Pit', 'Florence + The Machine', 'Grouplove', 'Beach House',
    'Tame Impala', 'Vampire Weekend', 'The National', 'Death Cab for Cutie', 'Modest Mouse', 'Mac DeMarco', 'alt-J', 'Phoebe Bridgers',
    'Mitski', 'The 1975', 'Sufjan Stevens', 'Fleet Foxes', 'Cigarettes After Sex', 'Spoon',
  ]},
  { id: 'electronic', name: 'Electronic', genre: 'Electronic', difficulty: 'hard', artists: [
    'Daft Punk', 'deadmau5', 'David Guetta', 'Avicii', 'Zedd', 'Skrillex', 'Martin Garrix', 'Swedish House Mafia', 'Kygo',
    'Major Lazer', 'Porter Robinson', 'Eric Prydz', 'Marshmello', 'Calvin Harris', 'Tiësto', 'Armin van Buuren', 'The Chemical Brothers',
    'Disclosure', 'Flume', 'ODESZA', 'Diplo', 'Alesso', 'Hardwell', 'Afrojack', 'Kaskade', 'Above & Beyond', 'Fatboy Slim', 'Justice',
    'RÜFÜS DU SOL',
  ]},
];

export const DIFFICULTIES = ['easy', 'medium', 'hard'];
