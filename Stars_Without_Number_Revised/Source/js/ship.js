/* global getAttrs, setAttrs, getSectionIDs, generateRowID, on, removeRepeatingRow, _, getTranslationByKey */

/* Ship Code */
const fillShipStats = () => {
    getAttrs(["ship_hulltype", ...shipStats], v => {
        const label = v.ship_hulltype && reverseHullTypes[v.ship_hulltype.toLowerCase()];
        if (label && autofillData.hulltypes.hasOwnProperty(label)) {
            const data = Object.assign({}, autofillData.hulltypes[label]);
            data.ship_hp_max = data.ship_hp;
            Object.keys(data).forEach(key => {
                //Might remove later. Unsure if desired feature.
                if (!(["", 0, "0"].includes(v[key])) && v.hasOwnProperty(key)) delete data[key]; //Prevents changing Hull Type
            });
            mySetAttrs(data, v);
            calculateShipStats();
        }
    });
};
const setShipClass = () => {
    // Sets the internal ship_class_normalised attribute responsible
    // for filtering ship modules according to class.
    getAttrs(["ship_class", "ship_class_normalised"], v => {
        if (["fighter", translate("FIGHTER").toLowerCase()].includes(v.ship_class.toLowerCase()))
            setAttrs({
                ship_class_normalised: "fighter"
            });
        else if (["frigate", translate("FRIGATE").toLowerCase()].includes(v.ship_class.toLowerCase()))
            setAttrs({
                ship_class_normalised: "frigate"
            });
        else if (["cruiser", translate("CRUISER").toLowerCase()].includes(v.ship_class.toLowerCase()))
            setAttrs({
                ship_class_normalised: "cruiser"
            });
        else mySetAttrs({
                ship_class_normalised: ""
            }, v);
    });
};
const calculateShipStats = () => {
    // Calculates power, mass, and hardpoints remaining.
    const doCalc = (weaponIDs, fittingIDs, defenseIDs) => {
        const oldAttrs = [
            ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_power`),
            ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_mass`),
            ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_hardpoints`),
            ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_price`),
            ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_power`),
            ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_mass`),
            ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_price`),
            ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_power`),
            ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_mass`),
            ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_price`),
            "ship_power_max", "ship_mass_max", "ship_hardpoints_max",
            "ship_power", "ship_mass", "ship_hardpoints", "ship_price", "ship_hull_price", "ship_calculate_price"
        ];
        getAttrs(oldAttrs, v => {
            const ship_power = v.ship_power_max - sum([
                ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_power`),
                ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_power`),
                ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_power`),
            ].map(x => v[x]));
            const ship_mass = v.ship_mass_max - sum([
                ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_mass`),
                ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_mass`),
                ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_mass`),
            ].map(x => v[x]));
            const ship_hardpoints = v.ship_hardpoints_max -
                sum(weaponIDs.map(id => v[`repeating_ship-weapons_${id}_weapon_hardpoints`]));
            const setting = {ship_power, ship_mass, ship_hardpoints}
            if (v.ship_calculate_price === "1") {
                setting.ship_price = new Intl.NumberFormat().format(parseInt(v.ship_hull_price) + sum([
                    ...weaponIDs.map(id => `repeating_ship-weapons_${id}_weapon_price`),
                    ...fittingIDs.map(id => `repeating_ship-fittings_${id}_fitting_price`),
                    ...defenseIDs.map(id => `repeating_ship-defenses_${id}_defense_price`),
                ].map(x => v[x])));
            }
            console.log(setting)
            mySetAttrs(setting, v, {
                silent: true
            });
        });
    };
    getSectionIDs("repeating_ship-weapons", A => getSectionIDs("repeating_ship-fittings", B => {
        getSectionIDs("repeating_ship-defenses", C => doCalc(A, B, C));
    }));
};