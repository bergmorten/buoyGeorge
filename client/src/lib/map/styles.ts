import {
  Circle as CircleStyle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import LineString from 'ol/geom/LineString';
import MultiPoint from 'ol/geom/MultiPoint';
import { getLength } from 'ol/sphere';
import type Polygon from 'ol/geom/Polygon';
import type { FeatureLike } from 'ol/Feature';

export const drawStyles = [
  new Style({
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.1)',
    }),
    stroke: new Stroke({
      color: 'red',
      width: 3,
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({
        color: 'orange',
      }),
    }),
    geometry: function (feature) {
      const geometry = feature.getGeometry() as Polygon | LineString;
      const type = geometry.getType() as string;

      if (geometry.getCoordinates) {
        const coordinates =
          type === 'LineString'
            ? (geometry.getCoordinates() as [][])
            : geometry.getCoordinates()[0];
        if (!coordinates) throw new Error('Failed to get coordinates');
        return new MultiPoint(coordinates);
      }
      return new MultiPoint([]);
    },
  }),
];

export type WaypointColors =
  | 'green'
  | 'yellow'
  | 'blue'
  | 'grey'
  | 'orange'
  | 'purple'
  | 'red'
  | 'pink'
  | 'white'
  | 'black';

export const waypointStyle = (
  index: number | string | undefined,
  color: WaypointColors,
) => {
  const subPath = typeof index === 'number' ? `${index % 1000}` : (index ?? '');
  const subType = index !== undefined ? `/${subPath}` : '';
  const src = `markers/${color}${subType}/marker.svg`;
  return new Style({
    image: new Icon({
      anchorOrigin: 'bottom-left',
      anchor: [0.5, 0],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src,
    }),
  });
};

export const telemetryStyle = (color?: WaypointColors) => {
  return new Style({
    image: new Icon({
      color: color ?? [0, 0, 0],
      opacity: 0.6,
      scale: 0.9,
      anchorOrigin: 'bottom-left',
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'markers/square.svg',
    }),
  });
};

export const emptyMarkerStyle = new Style({
  image: new Icon({
    color: 'orange',
    anchorOrigin: 'bottom-left',
    anchor: [0.5, 0.5],
    opacity: 0.5,
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: 'markers/emptyMarker.png',
  }),
});

export const highlightedEmptyMarkerStyle = new Style({
  image: new Icon({
    color: 'orange',
    anchorOrigin: 'bottom-left',
    anchor: [0.5, 0.5],
    opacity: 0.5,
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: 'markers/emptyHighlightMarker.png',
  }),
});

export const AttainmentStyle = (strictAttainmentMode: boolean) => {
  if (strictAttainmentMode)
    return new Style({
      stroke: new Stroke({
        color: 'rgba(66,28,82,0.8)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(66,28,82,0.4)',
      }),
    });
  else
    return new Style({
      stroke: new Stroke({
        color: 'rgba(66,28,82,0.4)',
        width: 4,
        lineDash: [10, 20],
      }),
      fill: new Fill({
        color: 'rgba(66,28,82,0.1)',
      }),
    });
};

export const assemblyStyle = () => {
  return new Style({
    fill: new Fill({
      color: 'rgba(255,95,31,0.4)',
    }),
  });
};

export const assemblyHoverStyle = () => {
  return new Style({
    fill: new Fill({
      color: 'rgba(255,95,31,0.6)',
    }),
  });
};

export const targetZoneStyle = () => {
  return new Style({
    fill: new Fill({
      color: 'rgba(106,13,173,0.4)',
    }),
  });
};

export const BufferStyle = () => {
  return new Style({
    fill: new Fill({
      color: 'rgba(33,186,69,0.2)',
    }),
  });
};

export const highlightedMarkerStyle = new Style({
  image: new Icon({
    anchorOrigin: 'bottom-left',
    anchor: [0.5, 0],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: 'markers/white/marker.svg',
  }),
});

export const vehicleStyle = (highlighted?: boolean) => {
  return new Style({
    zIndex: 9999,
    image: new Icon({
      anchorOrigin: 'bottom-left',
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: highlighted ? 'svg/gliderYellow.svg' : 'svg/gliderBlack.svg',
      scale: highlighted ? 1.8 : 1,
    }),
  });
};

export const userStyle = (highlighted?: boolean) => {
  return new Style({
    zIndex: 9999,
    image: new Icon({
      anchorOrigin: 'bottom-left',
      anchor: [0.5, 0],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      src: 'svg/user.svg',
      scale: highlighted ? 0.06 : 0.05,
    }),
  });
};

export const segmentStyle = ({
  color,
  dashed,
  text,
}: {
  color?: string;
  dashed?: boolean;
  text?: string;
}) => {
  const stroke = new Stroke({
    color: color ? color : '#3399CC',
    width: dashed ? 5 : 3,
    lineDash: dashed ? [0.4, 8] : undefined,
  });
  let textStyle: Text | undefined;
  if (text !== undefined) {
    textStyle = new Text({
      font: '12px Roboto,sans-serif',
      fill: new Fill({
        color: 'rgba(128, 128, 128, 1)',
      }),
      // backgroundFill: new Fill({
      //   color: 'rgba(0, 0, 0, 0.7)',
      // }),
      // padding: [3, 3, 3, 3],
      textBaseline: 'bottom',
      offsetY: 24,
      rotation: Math.PI / 2,
    });
    textStyle.setText(text);
  }

  return new Style({
    stroke,
    text: textStyle,
  });
};

export const segmentStyleFunction = ({
  color,
  dashed,
  text,
}: {
  color?: string;
  dashed?: boolean;
  text: string;
}) => {
  return (feature: FeatureLike, resolution: number) => {
    const stroke = new Stroke({
      color: color ? color : '#3399CC',
      width: dashed ? 5 : 3,
      lineDash: dashed ? [0.4, 8] : undefined,
    });
    let textStyle: Text | undefined;
    const geo = feature.getGeometry();
    let showText = false;

    let rotation = 0;

    if (geo instanceof LineString) {
      const length = getLength(geo);
      if (7 * text.length * resolution < length) {
        showText = true;
      }
      const coords = geo.getCoordinates();
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first && last) {
        const [x1, y1] = first; // Second-to-last point
        const [x2, y2] = last; // Last point
        if (x1 && x2 && y1 && y2) rotation = Math.atan2(y2 - y1, x2 - x1);
        if (rotation < 0) rotation += Math.PI;
        rotation = rotation % Math.PI;
        if (rotation > Math.PI / 2) rotation += Math.PI;
      }
    } else if (resolution * 2 < text.length) showText = true;

    if (showText) {
      textStyle = new Text({
        font: '12px Roboto,sans-serif',
        fill: new Fill({
          color: 'rgba(128, 128, 128, 1)',
        }),
        // backgroundFill: new Fill({
        //   color: 'rgba(0, 0, 0, 0.7)',
        // }),
        // padding: [3, 3, 3, 3],
        textAlign: 'center', // Align text properly along the line
        textBaseline: 'middle',
        offsetY: 16,
        rotation: -rotation,
      });
      textStyle.setText(text);
    }

    return [
      new Style({
        stroke,
        text: textStyle,
      }),
    ];
  };
};

export const driftStyle = (color?: string) => {
  const stroke = new Stroke({
    color: color ? color : [0, 0, 0, 0.5],
    width: 15,
  });

  return new Style({
    stroke,
  });
};

export const segmentHoverStyle = (color?: string) => {
  const stroke = new Stroke({
    color: color ? color : '#ff4500',
    width: 5,
  });

  return new Style({
    stroke,
  });
};

export const travelLineStyle = (color?: string) => {
  const style = new Style({
    stroke: new Stroke({
      width: 3,
      color: color,
      lineDash: [0.1, 5],
    }),
    zIndex: 2,
  });
  return style;
};

export const travelLineHoverStyle = (color?: string) => {
  const stroke = new Stroke({
    color: color ? color : '#ff4500',
    width: 5,
  });

  return new Style({
    stroke,
  });
};
