/*
	these are abstract roles used for bans and such
		Slaved Revived Mob
		Friendly Revived Mob
		Mind Transfer Potion
		Monkey Mind Magnification Helmet
		Posibrain
		Syndicate
		Lavaland
*/

export const roles = {
	nonRoles: [
		'Living', 'Ghost', 'Admin', 'Unknown', 'Unassigned Crewmember', 'valentine', 'highlander',
		'Avatar of the Wish Granter', 'exiled headrev', 'revolution enemy', 'Ghost Role', 'survivalist',
	],
	traitRoles: [
		'Veteran Security Advisor', 'Big Brother', 'Bridge Assistant', 'Cargorilla', 'Cargo Gorilla',
	],
	antagonistRoles: [
		// Roundstart roles
		'Blood Brother', 'Changeling', 'Cultist', 'Heretic', 'Malf AI', 'Operative', 'Traitor', 'Wizard', 'Spy',
		// Midround roles
		'Abductor', 'Xenomorph', 'Blob', 'Blob Infection', 'Changeling (Midround)', 'Fugitive', 'Lone Operative',
		'Malf AI (Midround)', 'Nightmare', 'Space Ninja',  'Space Pirate', 'Obsessed', 'Operative (Midround)', 'Paradox Clone',
		'Head Revolutionary', 'Pyroclastic Anomaly Slime', 'Revenant', 'Syndicate Sleeper Agent', 'Space Dragon', 'Spider',
		'Wizard (Midround)', 'Voidwalker',
		// Latejoin roles
		'Heretic Smuggler', 'Provocateur', 'Stowaway Changeling', 'Syndicate Infiltrator',
		// Other roles
		'Revolutionary', 'Clown Operative', 'Morph', 'Nuclear Operative', /* */ 'Abductor Scientist', 'Abductor Agent', 'Abductor Solo',
	],
	ghostRoles: [
		'Ectoplasmic Anomaly Ghost', 'Brainwashed Victim', 'Deathsquad', 'Sentience Potion Spawn', 'Positronic Brain',
		'Santa', 'Slaughter Demon', 'apprentice', 'Apprentice', 'Syndicate Monkey Agent', 'Contractor Support Unit', 'Operative Overwatch Agent',
		'Syndicate Sabotage Cyborg', 'Syndicate Medical Cyborg', 'Syndicate Assault Cyborg', 'Glitch', 'Cyber Police', 'Cyber Tac', 'NetGuardian Prime',
		'pAI', /* */ 'ERT Generic', 'Fugitive Hunter', 'Syndicate Cyborg',
	],
	spawnerRoles: [
		'Ancient Crew', 'Ash Walker', 'Battlecruiser Captain', 'Battlecruiser Crew', 'Beach Bum', 'Bot', 'Derelict Drone',
		'Escaped Prisoner', 'Exile', 'Hermit', 'Hotel Staff', 'Lavaland Syndicate', 'Lifebringer', 'Maintenance Drone',
		'Skeleton', 'Space Bar Patron', 'Space Bartender', 'Space Doctor', 'Space Syndicate',
		'Cybersun Space Syndicate', 'Cybersun Space Syndicate Captain', 'Syndicate Drone', 'Venus Human Trap', 'Zombie',
		'Drone', 'Malfunctioning Bot', 'Free Golem', 'Servant Golem',
	],
};
