require('dotenv').config();

const ownerIds = [
    '1454985695608180783', // ballizac
    '323431364340744192', // sounddrout
    '338896580029579264', // braden5512
    '798675881819111424' // frozenhyper
];

const adminIds = [
    '441350823675428866', // walkerofnothing
    '224981331078021124', // bhinni
    '280483454750031872' // elizabethducc
];

const hmodIds = [
    '703022317122617434', // imsamantha
    '710319752509128734', // origix
    '533524317083009044', // dwaam
    '804761929284976680', // pink.unicorn
    '401250600337145868' // undermaster.
];

const staffIds = [
    '441350823675428866', // walkerofnothing
    '224981331078021124', // bhinni
    '280483454750031872', // elizabethducc
    '703022317122617434', // imsamantha
    '710319752509128734', // origix
    '533524317083009044', // dwaam
    '804761929284976680', // pink.unicorn
    '401250600337145868', // undermaster.
    '416798214415450112', // xmo_
    '895326036433182770', // ben_games
    '832643218860146689', // adam58
    '406947642904543232', // thefrost1
    '338896580029579264', // braden5512
    '834411211315347537', // breeswasthebest
    '554814577389469696', // ghogurt
    '688202167722442773', // xigiro
    '798675881819111424', // frozenhyper
    '920874284988104785', // andy.yvr
    '1061802694362288229' // maki._
];

const config = {
    token: process.env.CLIENT_TOKEN,
    prefix: process.env.CLIENT_PREFIX,
    dbUrl: process.env.DATABASE_URL,
    owners: ownerIds,
    admins: adminIds,
    hmods: hmodIds,
    staff: staffIds,
};

module.exports = config;