import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
    GridListTile,
    GridList,
    Typography,
    Switch,
    FormControlLabel,
    FormGroup
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Plot from 'react-plotly.js';
import AppContext from '../context/AppContext.jsx';
import axios from 'axios';



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
    const [readings, setReadings] = useState({
        img: 'https://i.imgur.com/Pxk3kIC.jpg',
        lights: false,
    });
    const appCtx = useContext(AppContext);

    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('sm'));
    const columns = matches ? 1 : 3;
    const MAX_DATAPOINTS = 20;
    let counter = 0;


    const getDeviceSummary = async () => {
        return (await axios.get(`${appCtx.api}/device/summary`)).data;
    };

    const deviceRead = async (device) => {
        return (await axios.get(`${appCtx.api}/device/${device}/read`)).data;
    };

    const deviceWrite = async (device, command) => {
        return (await axios.get(`${appCtx.api}/device/${device}/write`,  { params: command })).data;
    };

    const readTemperatureHumidity = async () => {
        let res = await deviceRead('temp');

        data[0].y = data[0].y.slice(-MAX_DATAPOINTS);
        data[0].x = data[0].x.slice(-MAX_DATAPOINTS);

        data[1].y = data[1].y.slice(-MAX_DATAPOINTS);
        data[1].x = data[1].x.slice(-MAX_DATAPOINTS);

        data[0].x.push(++counter);
        data[0].y.push(res.temperature);

        data[1].x.push(counter);
        data[1].y.push(res.humidity);

        setRevision(Math.random());
    }

    const readCamera = async () => {
        let res = await deviceRead('camera');
        readings.img = res.base64;
        setReadings(readings)
    };

    const readLights = async () => {
        let res = await deviceRead('lights');
        readings.lights = res.value === '1';
        setReadings(readings)
    };

    const poolData = async () => {
        let res = await getDeviceSummary();
        console.log(res);

        readLights();
        setInterval(readTemperatureHumidity, 5000);
        setInterval(readCamera, 4000);
    };

    useEffect(() => {
        console.log(appCtx.api);
        if (appCtx.api !== '') {
            poolData();
        }
    }, [appCtx.api]);

    const handleChange = name => event => {
        setReadings({ ...readings, [name]: event.target.checked });

        if (name === 'lights') {
            deviceWrite('lights', { value: event.target.checked ? 1 : 0 });
        }
    };

    useEffect(() => {
    }, []);

    return (
        <div style={style.root}>
            <GridList cols={columns} spacing={1} padding={0}>
                <GridListTile>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={readings.lights}
                                onChange={handleChange('lights')}
                                value="lights"
                                color="primary"
                            />
                        }
                        label="Lights"
                    />
                </GridListTile>
                <GridListTile cols={Math.min(2, columns)}>
                    <img src={readings.img} />
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
