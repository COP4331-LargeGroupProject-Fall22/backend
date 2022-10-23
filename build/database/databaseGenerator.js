"use strict";
for (var i = 1; i <= 1000; i++) {
    let firstNames = [
        "Alex",
        "Michael",
        "John",
        "Tim",
        "Den",
        "Mo",
        "Jacob",
        "Bob",
        "Kate",
        "Sasha",
        "Alina",
        "Katya",
        "Nastya",
        "Olya",
        "Alla",
        "Polina"
    ];
    let lastNames = [
        "Cook",
        "Elsher",
        "Solace",
        "Thatcher",
        "Ashley",
        "Cromwell",
        "Langley",
        "Plekunov",
        "Daughtler",
        "Hope",
        "Stoll",
        "Wilson"
    ];
    let uid = Math.floor(Math.random() * 1000) + 30412;
    let firstNameIndex = Math.floor(Math.random() * firstNames.length);
    let lastNameIndex = Math.floor(Math.random() * lastNames.length);
    db.Users.insert({
        firstName: firstNames[firstNameIndex],
        lastName: lastNames[lastNameIndex],
        uid: `123lk02psiao${uid}`,
        lastSeen: 123454093567,
        inventory: [{
                expirationDate: 1231123,
                name: "Milk",
                id: 234,
                category: "Diary",
                nutrients: [
                    {
                        name: "Calcium",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    },
                    {
                        name: "Vitamin D",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    },
                    {
                        name: "Vitamin A",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    },
                    {
                        name: "Phosphorus",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    },
                    {
                        name: "Magnesium",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    },
                    {
                        name: "Zinc",
                        unit: {
                            unit: "mg",
                            value: Math.floor(Math.random() * 500)
                        },
                        percentOfDaily: Math.floor(Math.random() * 100)
                    }
                ]
            }]
    });
}
//# sourceMappingURL=databaseGenerator.js.map