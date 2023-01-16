import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ApexFill,
  ChartComponent,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { WebSocketService } from 'src/app/web-socket.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
};
@Component({
  selector: 'app-semi-circle-chart',
  templateUrl: './semi-circle-chart.component.html',
  styleUrls: ['./semi-circle-chart.component.scss'],
})
export class SemiCircleChartComponent implements OnInit {

  @ViewChild("chartDiv",{static: false}) chartDiv: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  @Input() title: any;
  @Input() chart: any;
  series: any = [];
  @Input() subtitle: any;
  @Input() data: any;
  chartData:any = {};

  constructor(public websocketService: WebSocketService) { }

  ngOnInit() {
    this.chartConfig();
    this.drawChart();

    this.chartOptions = this.getGraphData();
    this.chartOptions.series = this.getGraphDataArray()
    console.log(this.chartData, this.chartOptions)
    this.websocketService.sensorData.subscribe(data => {
      this.updateSocketData(data);
    });

  }

  getGraphData() {
    var chart = eval("(" + this.chart.chart_details.javascript.replace(/[^\x20-\x7E]/gim, "") + ")")
    return chart
  }

  getGraphDataArray() {
    var sensorData = [];
    for (var i = 0; i < this.chart.chart_details.sensor.length; i++) {
      if (!this.isNullOrUndefined(this.chart.chart_details.sensor[i]['data']) && this.chart.chart_details.sensor[i]['data'].length > 0) {
        if (!this.isNullOrUndefined(this.chart.chart_details.sensor[i]['equipment'])) {
          this.chartData['title'] = this.chart.chart_details.sensor[i]['equipment']['name']
        } else {
          this.chartData['title'] = this.chart.chart_details.sensor[i]['department']['name']
        }
        this.chartData['unit_disp'] = this.chart.chart_details.sensor[0]['unit_disp']
        for (var j = 0; j < 1; j++) {
          sensorData.push(Math.round(this.chart.chart_details.sensor[i]['data'][j]["value"] * 100) / 100);
        }
      } else {
        sensorData.push(0);
      }
    }
    return sensorData
  }

  drawChart(){
    setTimeout(() => {
      this.chartOptions.title = {text:this.title};
      this.chartOptions.subtitle = {text:this.subtitle};
      this.websocketService.sensorData.subscribe(data => {
        // if (this.ageType == 'live') { // live graph check
          // this.updateSocketData(data);
        // }
        this.chartOptions.series = [80];
      });
    },1000);
  }

  updateSocketData(data:any) {
    if (Object.keys(data).length != 0) {
      if (this.chart.chart_details.sensor.length > 0 &&
        !this.isNullOrUndefined(data[this.chart.chart_details.sensor[0]['uuid']]) &&
        !this.isNullOrUndefined(this.chartOptions) &&
        !this.isNullOrUndefined(this.chartOptions.series)){

        console.log("update", this.chart)
        var point = this.chartOptions.series[0];
        this.chartOptions.series = this.getGraphDataArray();
        // Math.round(data[this.chart.chart_details.sensor[0]['uuid']][0]["value"] * 100) / 100

      }
    }
  }

  convertUTCDateToLocalDate(date:any) {
    var newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    return newDate;
  }

  isNullOrUndefined<T>(obj: T | null | undefined): obj is null | undefined {
    return typeof obj === "undefined" || obj === null;
  }

  chartConfig(){
    this.chartOptions = {
      series: [],
      chart: {
        type: "radialBar",
        offsetY: -20
      },
      title: {text:'testing'},
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: {
            background: "#e7e7e7",
            strokeWidth: "97%",
            margin: 5, // margin is in pixels
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              opacity: 0.31,
              blur: 2
            }
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              offsetY: -2,
              fontSize: "22px"
            }
          }
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          shadeIntensity: 0.4,
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [0, 50, 53, 91]
        }
      },
      labels: ["Average Results","testings"]
    };
  }

}
