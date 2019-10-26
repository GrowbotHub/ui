import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    GridListTile,
    GridList,
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Plot from 'react-plotly.js';


const style = {
    root: {
        flexGrow: 1,
    },
    paper: {
        textAlign: 'center',
        backgroundColor: 'red',
        height: '100%',
    },
};

const data = [
    {
        name: 'Temperature',
        x: [],
        y: [],
        mode: 'lines+markers',
        marker: { color: 'red' },

    },
    {
        name: 'Humidity',
        x: [],
        y: [],
        mode: 'lines+markers',
        marker: { color: 'blue' },
        yaxis: 'y2',
    },
];

const layout = {
    autosize: true,
    margin: { l: 25, t: 0, r: 25, b: 25 },
    showlegend: true,

    legend: {
        x: 0,
        y: 1,
    },

    yaxis: { title: 'Temperature' },
    yaxis2: {
        title: 'Humidity', overlaying: 'y',
        side: 'right'
    },
}

export default () => {
    const [revision, setRevision] = useState(0);
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));
    const columns = matches ? 1 : 3;
    const MAX_DATAPOINTS = 20;
    let counter = 0;

    useEffect(() => {
        for (let i = 0; i < MAX_DATAPOINTS; i++) {
            data[0].x.push(++counter);
            data[0].y.push(Math.random() + 20);

            data[1].x.push(counter);
            data[1].y.push(Math.random() + 50);
        }

        setInterval(() => {
            data[0].y = data[0].y.slice(-MAX_DATAPOINTS);
            data[0].x = data[0].x.slice(-MAX_DATAPOINTS);

            data[1].y = data[1].y.slice(-MAX_DATAPOINTS);
            data[1].x = data[1].x.slice(-MAX_DATAPOINTS);

            data[0].x.push(++counter);
            data[0].y.push(Math.random() + 20);

            data[1].x.push(counter);
            data[1].y.push(Math.random() + 50);

            setRevision(Math.random());
        }, 1000);
    }, []);

    return (
        <div style={style.root}>
            <GridList cols={columns} spacing={1} padding={0}>
                <GridListTile cols={Math.min(2, columns)}>
                    <img src="https://i.imgur.com/Pxk3kIC.jpg" />
                </GridListTile>
                <GridListTile cols={1} rows={2} style={{ display: 'flex', flexDirection: 'column' }}>
                    <Plot
                        style={{ flex: 1, width: '100%', height: '100%' }}
                        datarevision={revision}
                        data={data}
                        config={{ responsive: true }}
                        useResizeHandler={true}
                        layout={layout}
                    />
                </GridListTile>
            </GridList>
        </div>
    );
}
