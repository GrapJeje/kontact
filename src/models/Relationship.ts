export const Relationship = {
    Mother: 'Mother',
    Father: 'Father',
    Brother: 'Brother',
    Sister: 'Sister',
    Son: 'Son',
    Daughter: 'Daughter',
    Friend: 'Friend',
    Family: 'Family',
    Colleague: 'Colleague',
} as const;

export type Relationship = typeof Relationship[keyof typeof Relationship];
