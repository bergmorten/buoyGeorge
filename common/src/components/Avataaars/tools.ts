import { accessoriesTypes } from './assetsTypes/accessories';
import { clothesTypes } from './assetsTypes/clothes';
import { eyeTypes } from './assetsTypes/eyes';
import { eyebrowTypes } from './assetsTypes/eyebrows';
import { facialHairTypes } from './assetsTypes/facial-hair';
import { graphicShirtTypes } from './assetsTypes/graphic-shirt';
import {
    hairColors,
    hatAndShirtColors,
    skinColors,
} from './assetsTypes/colors';
import { mouthTypes } from './assetsTypes/mouth';
import { topTypes } from './assetsTypes/top';
import type { AvataaarModel } from './models';

const getRandomChoice = <T extends Record<string, string>>(model: T) => {
    const keys = Object.keys(model);
    return keys[Math.floor(Math.random() * keys.length)] as keyof T;
};

export const randomAvataaar = (): string => {
    const avatar: AvataaarModel = {
        topType: getRandomChoice(topTypes),
        accessoriesType: getRandomChoice(accessoriesTypes),
        facialHairType: getRandomChoice(facialHairTypes),
        clotheType: getRandomChoice(clothesTypes),
        eyeType: getRandomChoice(eyeTypes),
        eyebrowType: getRandomChoice(eyebrowTypes),
        mouthType: getRandomChoice(mouthTypes),
        graphicType: getRandomChoice(graphicShirtTypes),
        skinColor: getRandomChoice(skinColors),
        hairColor: getRandomChoice(hairColors),
        facialHairColor: getRandomChoice(hairColors),
        topColor: getRandomChoice(hatAndShirtColors),
        clotheColor: getRandomChoice(hatAndShirtColors),
    };
    return JSON.stringify(avatar);
};
