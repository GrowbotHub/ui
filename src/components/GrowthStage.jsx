import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import {
    Grid,
    Typography,
    Switch,
    FormControlLabel,
    FormGroup
} from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Plot from 'react-plotly.js';
import AppContext from '../context/AppContext.jsx';
import useInterval from '@use-it/interval';
import ROSLIB from 'roslib';
import {Line} from 'react-chartjs-2';

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

let counter = 0;

const datas = [
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

const data = {
    labels: [],
    datasets: [
      {
        label: 'Temperature',
        data: [ ]
      },
      {
        label: 'Humidity',
        data: [ ]
      }
    ]
  };

let ros = new ROSLIB.Ros();

export default () => {
    const [tempData, setTempData] = useState(data);
    const [readings, setReadings] = useState({
        image: 'https://miro.medium.com/max/1080/0*DqHGYPBA-ANwsma2.gif',
        lights: false,
    });
    const tempChart = useRef(null);
    const appCtx = useContext(AppContext);
    const MAX_DATAPOINTS = 12;

    const deviceRead = (device) => {
        let service = new ROSLIB.Service({
            ros : ros,
            name : 'device_read',
            serviceType : 'growbothub_tlc/DeviceReadWrite'
          });
        
          let request = new ROSLIB.ServiceRequest({
            device_id: device,
            command: ''
          });

        return new Promise(function(resolve, reject) {
            service.callService(request, (result) => {
                let response = JSON.parse(result.readings);
                resolve(response);
            });
          });
    };

    const deviceWrite = async (device, command) => {
        let service = new ROSLIB.Service({
            ros : ros,
            name : 'device_write',
            serviceType : 'growbothub_tlc/DeviceReadWrite'
          });
        
          let request = new ROSLIB.ServiceRequest({
            device_id: device,
            command: JSON.stringify(command)
          });

        return new Promise(function(resolve, reject) {
            service.callService(request, (result) => {
                resolve();
            });
          });
    };

    const readTemperatureHumidity = async () => {
        let res = await deviceRead('temp');
        let d = (new Date());
        let time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;

        tempData.labels.push(time);
        tempData.labels = tempData.labels.slice(-MAX_DATAPOINTS);

        tempData.datasets[0].data.push(res.temperature);
        tempData.datasets[0].data = tempData.datasets[0].data.slice(-MAX_DATAPOINTS);

        tempData.datasets[1].data.push(res.humidity);
        tempData.datasets[1].data = tempData.datasets[1].data.slice(-MAX_DATAPOINTS);

        setTempData(tempData);
    }

    const readCamera = async () => {
        let res = await deviceRead('camera');
        setReadings({ ...readings, image: res.base64 });
    };

    const readLights = async () => {
        let res = await deviceRead('lights');
        setReadings({ ...readings, lights: res.value == '1'});
    };

    const poolData = async () => {
        readLights();
    };

    useInterval(() => {
        if (appCtx.api !== '') {
            readCamera();
        }
    }, 5000);

    useInterval(() => {
        if (appCtx.api !== '') {
            readTemperatureHumidity();
        }
    }, 4000);

    useEffect(() => {
        if (appCtx.api !== '') {
            console.log('start', appCtx.api);
            ros.connect('ws://' + appCtx.api);
            poolData();
        }
    }, [appCtx.api]);

    const handleChange = name => event => {
        console.log(name, event.target.checked);
        setReadings({ ...readings, [name]: event.target.checked });

        if (name === 'lights') {
            deviceWrite('lights', { value: event.target.checked ? 1 : 0 });
        }
    };

    useEffect(() => {
    }, []);

    return (
        <div style={style.root}>
            <Grid container spacing={3}>
                <Grid item xs={1}>
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
                </Grid>


                <Grid item xs={6}>
                    <img src={readings.image} />
                </Grid>

                <Grid item xs={12}>
                    <Line ref={tempChart} data={tempData} options={{maintainAspectRatio: false}} style={{ width: '100%', height: '100%' }} />
                </Grid>
            </Grid>
        </div>
    );
}
