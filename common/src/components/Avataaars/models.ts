import type { accessoriesTypes } from './assetsTypes/accessories';
import type { clothesTypes } from './assetsTypes/clothes';
import type { eyeTypes } from './assetsTypes/eyes';
import type { eyebrowTypes } from './assetsTypes/eyebrows';
import type { facialHairTypes } from './assetsTypes/facial-hair';
import type { graphicShirtTypes } from './assetsTypes/graphic-shirt';
import type {
    hairColors,
    hatAndShirtColors,
    skinColors,
} from './assetsTypes/colors';
import type { mouthTypes } from './assetsTypes/mouth';
import type { topTypes } from './assetsTypes/top';

export type TopType = keyof typeof topTypes;
export type AccessoriesTypes = keyof typeof accessoriesTypes;
export type FacialHairTypes = keyof typeof facialHairTypes;
export type ClothesTypes = keyof typeof clothesTypes;
export type EyeTypes = keyof typeof eyeTypes;
export type EyebrowTypes = keyof typeof eyebrowTypes;
export type MouthTypes = keyof typeof mouthTypes;
export type SkinColors = keyof typeof skinColors;
export type HairColors = keyof typeof hairColors;
export type GraphicShirtTypes = keyof typeof graphicShirtTypes;
export type HatAndShirtColors = keyof typeof hatAndShirtColors;

export interface AvataaarModel {
    topType: TopType;
    accessoriesType: AccessoriesTypes;
    facialHairType: FacialHairTypes;
    clotheType: ClothesTypes;
    eyeType: EyeTypes;
    eyebrowType: EyebrowTypes;
    mouthType: MouthTypes;
    skinColor: SkinColors;
    hairColor: HairColors;
    facialHairColor: HairColors;
    topColor: HatAndShirtColors;
    clotheColor: HatAndShirtColors;
    graphicType: GraphicShirtTypes;
}
