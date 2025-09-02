import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { AMCHART_LICENSE } from 'client/license';
import type { ForecastMinimal } from 'client/services/yr';
import { useUnitStore } from 'client/stores/units';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface DataContext {
    index: number;
    date: number;
    value: number | null;
}

interface TemperatureDataContext extends DataContext {
    date: number;
    symbolCode: string | null;
}

interface WindDataContext extends DataContext {
    direction: number | null;
    zero: 0 | null;
    windIcon: { src: string; rotation: number } | null;
}

interface PrecipitationDataContext extends DataContext {
    maxValue: number | null;
}

export const drawMetroGram = async (
    element: HTMLDivElement,
    forecast: ForecastMinimal,
) => {
    am5.addLicense(AMCHART_LICENSE);
    const unitStore = useUnitStore();

    const root = am5.Root.new(element);

    const themes: am5.Theme[] = [am5themes_Animated.new(root)];

    root.setThemes(themes);
    const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
            panX: true,
            panY: false,
            paddingBottom: 50,
            wheelX: 'panX',
        }),
    );
    chart.zoomOutButton.dispose();

    const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: 'hour', count: 1 },

            maxZoomCount: 24,
            gridIntervals: [{ timeUnit: 'hour', count: 2 }],
            markUnitChange: false,
            renderer: am5xy.AxisRendererX.new(root, {
                opposite: true,
                minGridDistance: 1,
                pan: 'none',
            }),
            panX: false,
            // tooltip: am5.Tooltip.new(root, {}),
        }),
    );

    const hourFormat = xAxis.get('dateFormats');
    if (hourFormat) hourFormat['hour'] = 'HH';

    const yAxisTemperature = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            height: am5.percent(50),
            x: am5.percent(100),
            centerX: am5.percent(100),
            renderer: am5xy.AxisRendererY.new(root, { pan: 'zoom' }),
        }),
    );
    yAxisTemperature.children.moveValue(
        am5.Label.new(root, {
            text: `Temperature ${unitStore.temperatureUnit}`,
            rotation: -90,
            y: am5.p50,
            centerX: am5.p50,
        }),
        0,
    );

    yAxisTemperature.axisHeader.children.push(
        am5.Label.new(root, {
            text: 'Temperature & Precipitation',
            fontWeight: '500',
        }),
    );

    const yAxisWind = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            height: am5.percent(50),
            x: am5.percent(100),
            centerX: am5.percent(100),
            renderer: am5xy.AxisRendererY.new(root, {}),
        }),
    );
    yAxisWind.axisHeader.set('paddingTop', 10);
    yAxisWind.axisHeader.children.push(
        am5.Label.new(root, {
            text: 'Wind & Pressure',
            fontWeight: '500',
        }),
    );

    yAxisWind.children.moveValue(
        am5.Label.new(root, {
            text: unitStore.speedUnit,
            rotation: -90,
            y: am5.p50,
            centerX: am5.p50,
        }),
        0,
    );
    const yAxisPressure = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            height: am5.percent(50),
            x: am5.percent(100),
            centerX: am5.percent(100),
            syncWithAxis: yAxisWind,
            renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
        }),
    );
    yAxisPressure.axisHeader.set('paddingTop', 10);
    yAxisPressure.children.moveValue(
        am5.Label.new(root, {
            text: unitStore.pressureUnit,
            rotation: -90,
            x: am5.p100,
            centerX: am5.p100,
            paddingTop: 40,
        }),
        0,
    );
    yAxisPressure.axisHeader.children.push(
        am5.Label.new(root, {
            text: 'Wind & Pressure',
            fontWeight: '500',
        }),
    );

    const yAxisRain = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
            height: am5.percent(50),
            x: am5.percent(100),
            centerX: am5.percent(100),
            syncWithAxis: yAxisTemperature,
            renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
        }),
    );

    yAxisRain.children.moveValue(
        am5.Label.new(root, {
            text: `${unitStore.precipitationUnit}/h`,
            rotation: -90,
            y: am5.p50,
            x: am5.p100,
            centerX: am5.p100,
            paddingTop: 40,
        }),
        0,
    );
    yAxisRain.axisHeader.children.push(
        am5.Label.new(root, {
            text: 'Temperature & Precipitation',

            fontWeight: '500',
        }),
    );
    yAxisRain.axisHeader.get('background')?.setAll({
        fill: am5.color(0x000000),
        fillOpacity: 0,
    });

    // Stack Y-axes
    chart.leftAxesContainer.set('layout', root.verticalLayout);
    chart.rightAxesContainer.set('layout', root.verticalLayout);

    // https://www.amcharts.com/docs/v5/tutorials/using-adapters-on-category-axis-labels/
    const makeDayRange = (dayrange: {
        start: Date;
        end: Date;
        label: string;
    }) => {
        const { start, end, label } = dayrange;
        const rangeDataItem = xAxis.makeDataItem({
            value: start.getTime(),
            endValue: end.getTime(),
        });

        const range = xAxis.createAxisRange(rangeDataItem);

        const labelObject = rangeDataItem.get('label');

        if (labelObject)
            labelObject.setAll({
                //fill: am5.color(0x000000),
                text: label,
                fontWeight: 'bold',
                opacity: 0.6,
                dy: -20,
            });

        const tick = range.get('tick');
        if (tick)
            tick.setAll({
                visible: true,
                strokeOpacity: 0.2,
                length: 50,
                location: 0,
            });

        const gridObject = rangeDataItem.get('grid');

        if (gridObject)
            gridObject.setAll({
                strokeOpacity: 0.2,
                location: 1,
            });
    };

    const parseYrForecast = () => {
        const symbols = [];
        const temperatures: TemperatureDataContext[] = [];
        const precipitations: PrecipitationDataContext[] = [];
        const winds: WindDataContext[] = [];
        const pressures: DataContext[] = [];

        const dayRanges = [];
        let currentDay;

        //let numHours = 0;
        let index = 0;
        let prevWindDate = new Date(0);
        for (const timeStep of forecast.timesteps) {
            //if (numHours++ >= 48) break;
            const date = new Date(timeStep.time);

            if (!currentDay) {
                currentDay = {
                    start: date,
                    end: date,
                    label: date.toLocaleDateString(),
                };
            } else if (currentDay.label !== date.toLocaleDateString()) {
                currentDay.end = date;
                dayRanges.push({ ...currentDay });
                currentDay.start = date;
                currentDay.label = date.toLocaleDateString();
            }

            const symbolCode = timeStep.code ?? null;

            /*
      const to = timeData.next_1_hours
        ? x + 36e5 // 1 hour
        : timeData.next_6_hours
        ? x + 6 * 36e5 // 6 hours
        : x + 12 * 36e5; // 12 hours
*/
            symbols.push(symbolCode);

            const tempValue = timeStep.temp ?? null;

            temperatures.push({
                index,
                date: date.valueOf(),
                value:
                    tempValue !== null
                        ? unitStore.convertTemperature(tempValue)
                        : tempValue,
                symbolCode,
            });

            const genWindIcon = (
                speed: number | null,
                direction: number | null,
            ) => {
                if (speed === null || direction === null) return null;

                const beaufortScale = (speed: number) => {
                    if (speed < 0.5) return 0;
                    if (speed <= 1.5) return 1;
                    if (speed <= 3.3) return 2;
                    if (speed <= 5.5) return 3;
                    if (speed <= 7.9) return 4;
                    if (speed <= 10.7) return 5;
                    if (speed <= 13.8) return 6;
                    if (speed <= 17.1) return 7;
                    if (speed <= 20.7) return 8;
                    if (speed <= 24.4) return 9;
                    if (speed <= 28.4) return 10;
                    if (speed <= 32.6) return 11;
                    return 12;
                };

                return {
                    src: `weather/wind/wind-${beaufortScale(speed)}.svg`,
                    rotation: direction + 90,
                };
            };

            const direction = timeStep.wdir ?? null;
            const windSpeed = timeStep.wspeed ?? null;

            const showWindMarker =
                date.valueOf() - prevWindDate.valueOf() > 1000 * 3600;
            if (showWindMarker) prevWindDate = date;
            winds.push({
                index,
                date: date.valueOf(),
                value:
                    windSpeed !== null
                        ? unitStore.convertSpeed(windSpeed)
                        : windSpeed,
                zero: showWindMarker ? 0 : null,
                direction,

                windIcon: showWindMarker
                    ? genWindIcon(windSpeed, direction)
                    : null,
            });

            const pressureValue = timeStep.press ?? null;

            pressures.push({
                index,
                date: date.valueOf(),
                value:
                    pressureValue !== null
                        ? unitStore.convertPressure(pressureValue * 100) // yr use mbar
                        : pressureValue,
            });

            const precipitationValue = timeStep.rain ?? null;
            const precipitationMaxValue = timeStep.rainMax ?? null;

            precipitations.push({
                index,
                date: date.valueOf(),
                value:
                    precipitationValue !== null
                        ? unitStore.convertPrecipitation(precipitationValue)
                        : precipitationValue,
                maxValue:
                    precipitationMaxValue !== null
                        ? unitStore.convertPrecipitation(precipitationMaxValue)
                        : precipitationMaxValue,
            });
            index++;
        }
        return {
            temperatures,
            winds,
            pressures,
            precipitations,
            symbols,
            dayRanges,
        };
    };

    const data = parseYrForecast();

    const temperatureSeries = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
            name: 'Temperature',
            xAxis: xAxis,
            yAxis: yAxisTemperature,
            valueXField: 'date',
            valueYField: 'value',
            connect: true,
            stroke: am5.color(0xff0000),
            locationX: 0,
            tooltip: am5.Tooltip.new(root, {
                labelText: `{valueY} ${unitStore.temperatureUnit}`,
            }),
        }),
    );

    temperatureSeries.strokes.template.setAll({
        strokeWidth: 2,
    });

    const temperatureNegativeRange = yAxisTemperature.makeDataItem({
        value: 0,
        endValue: -100,
    });

    const range = temperatureSeries.createAxisRange(temperatureNegativeRange);
    const stroke = range.strokes;
    if (stroke)
        stroke.template.setAll({
            stroke: am5.color(0x0000ff),
        });

    // Pre-zoom X axis
    temperatureSeries.events.once('datavalidated', () => {
        const start = new Date(data.temperatures.at(0)?.date ?? 0);
        const end = new Date(data.temperatures.at(-1)?.date ?? 0);
        xAxis.zoomToDates(start, end);

        yAxisTemperature.setAll({
            min: yAxisTemperature.getPrivate('min') ?? 0,
            max: yAxisTemperature.getPrivate('max') ?? 30,
        });
    });

    let prevWeatherSymbolTimestamp = 0;
    temperatureSeries.bullets.push((root, series, dataItem) => {
        const context = dataItem.dataContext as TemperatureDataContext;
        if (context.date > prevWeatherSymbolTimestamp + 36e5 * 1.5) {
            prevWeatherSymbolTimestamp = context.date;
            if (context.symbolCode) {
                const symbol = `weather/${context.symbolCode}.svg`;
                return am5.Bullet.new(root, {
                    locationX: 0,
                    locationY: 0,

                    sprite: am5.Picture.new(root, {
                        width: 24,
                        height: 24,
                        centerY: am5.p50,
                        centerX: am5.p50,
                        src: symbol,
                    }),
                });
            }
        }
    });

    const precipitationsSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: 'Precipitation',
            xAxis: xAxis,
            yAxis: yAxisRain,
            valueXField: 'date',
            valueYField: 'value',
            fill: am5.color(0x198cff),
            stacked: false,
            locationX: 0,
            tooltip: am5.Tooltip.new(root, {
                labelText: `{valueY} ${unitStore.precipitationUnit}/h`,
            }),
        }),
    );

    precipitationsSeries.events.once('datavalidated', () => {
        yAxisRain.setAll({
            min: yAxisRain.getPrivate('min') ?? 0,
            max: yAxisRain.getPrivate('max') ?? 20,
        });
    });

    const precipitationsMaxSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: 'Precipitation Max',
            xAxis: xAxis,
            yAxis: yAxisRain,
            valueXField: 'date',
            valueYField: 'maxValue',
            fill: am5.color(0x78c1ff),
            locationX: 0,
            stacked: true,
        }),
    );
    precipitationsMaxSeries.columns.template.set(
        'fillPattern',
        am5.LinePattern.new(root, {
            color: am5.color(0xffffff),
            rotation: 45,
            width: 200,
            height: 200,
        }),
    );

    const precipitationsLineSeries = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
            name: 'Precipitation',
            xAxis: xAxis,
            yAxis: yAxisRain,
            valueXField: 'date',
            valueYField: 'value',
            connect: true,
            locationX: 0,
            stroke: am5.color(0x2871cc),
        }),
    );
    precipitationsLineSeries.strokes.template.setAll({
        strokeWidth: 2,
    });
    precipitationsLineSeries.fills.template.setAll({
        fillOpacity: 0.2,
        visible: true,
    });
    const windSeries = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
            name: 'Wind',
            xAxis: xAxis,
            yAxis: yAxisWind,
            valueXField: 'date',
            valueYField: 'value',
            connect: true,
            locationX: 0,
            stroke: am5.color(0x043927),
            fill: am5.color(0x043927),
            tooltip: am5.Tooltip.new(root, {
                labelText: `{valueY} ${unitStore.speedUnit} @ {direction}`,
            }),
        }),
    );

    windSeries.strokes.template.setAll({
        strokeWidth: 2,
    });

    windSeries.events.once('datavalidated', () => {
        yAxisWind.setAll({
            min: yAxisWind.getPrivate('min') ?? 0,
            max: yAxisWind.getPrivate('max') ?? 20,
        });
    });

    const beaufortSeries = chart.series.push(
        am5xy.ColumnSeries.new(root, {
            name: 'Wind',
            xAxis: xAxis,
            yAxis: yAxisWind,
            valueXField: 'date',
            valueYField: 'zero',
            locationX: 0,
            stacked: true,
        }),
    );

    beaufortSeries.bullets.push(function () {
        return am5.Bullet.new(root, {
            locationY: 1,
            sprite: am5.Picture.new(root, {
                templateField: 'windIcon',
                width: 25,
                height: 25,
                centerX: am5.p50,
                centerY: am5.p50,
            }),
        });
    });

    const pressureSeries = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
            name: 'Pressure',
            xAxis: xAxis,
            yAxis: yAxisPressure,
            valueXField: 'date',
            valueYField: 'value',
            stroke: am5.color(0xff9f00),
            fill: am5.color(0xff9f00),
            connect: true,
            locationX: 0,
            tooltip: am5.Tooltip.new(root, {
                labelText: `{valueY} ${unitStore.pressureUnit}`,
            }),
        }),
    );

    pressureSeries.strokes.template.setAll({
        strokeWidth: 2,
    });

    pressureSeries.events.once('datavalidated', () => {
        yAxisPressure.setAll({
            min: yAxisPressure.getPrivate('min') ?? 990,
            max: yAxisPressure.getPrivate('max') ?? 1000,
        });
    });

    await chart.appear(250, 100);
    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    const cursor = chart.set(
        'cursor',
        am5xy.XYCursor.new(root, {
            behavior: 'none',
        }),
    );

    cursor.lineY.set('visible', false);

    temperatureSeries.data.setAll(data.temperatures);
    void temperatureSeries.appear(1000, 0);

    precipitationsSeries.data.setAll(data.precipitations);
    void precipitationsSeries.appear(1000, 0);

    precipitationsMaxSeries.data.setAll(data.precipitations);
    void precipitationsMaxSeries.appear(1000, 0);

    precipitationsLineSeries.data.setAll(data.precipitations);
    void precipitationsLineSeries.appear(1000, 0);

    windSeries.data.setAll(data.winds);
    void windSeries.appear(1000, 0);

    beaufortSeries.data.setAll(data.winds);
    void beaufortSeries.appear(1000, 0);

    pressureSeries.data.setAll(data.pressures);
    void pressureSeries.appear(1000, 0);

    for (const dayRange of data.dayRanges) {
        makeDayRange(dayRange);
    }

    const legend = chart.children.push(
        am5.Legend.new(root, {
            y: am5.p100,
            x: am5.p50,
            centerX: am5.percent(50),
            paddingTop: 10,
        }),
    );
    legend.data.setAll([
        pressureSeries,
        windSeries,
        temperatureSeries,
        precipitationsSeries,
    ]);

    return chart;
};
