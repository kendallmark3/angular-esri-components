import { Component, OnInit, Input, Output, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { EsriMapService } from './../core/index';
import { environment } from '../../environments/environment';

@Component({
  selector: 'esri-map',
  template: `
    <div class="map" id="esri-map" #map></div>
  `,
  styles: [`
  /* Required CSS for the ArcGIS API for JavaScript */
  @import '${environment.arcGisCssUrl}';

  .map {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }
    ` ]
})
export class EsriMapComponent implements OnInit {
  map: __esri.Map;
  view: __esri.View;

  @ViewChild('map') mapEl: ElementRef;

  @Input() mapProperties: __esri.MapProperties;
  @Input() webMapProperties: __esri.WebMapProperties;
  @Input() viewType: string = 'MapView';
  @Input() viewProperties: __esri.ViewProperties = {};
  @Output() mapInit = new EventEmitter();

  constructor(private mapService: EsriMapService) { }

  ngOnInit() {
    if (this.map) {
      // map is already initialized
      return;
    }

    this.loadMap();
  }

  loadMap() {
    let mapPromise: Promise<any>;

    // determine if loading a WebMap or creating a custom map
    if (this.mapProperties) {
      mapPromise = this.mapService.loadMap(this.mapProperties, this.viewProperties, this.mapEl, this.viewType);
    } else if (this.webMapProperties) {
      mapPromise = this.mapService.loadWebMap(this.webMapProperties, this.viewProperties, this.mapEl, this.viewType);
    } else {
      console.error('Proper map properties were not provided');
      return;
    }

    mapPromise.then(mapInfo => {
      this.map = mapInfo.map;
      this.view = mapInfo.view;

      // emit event informing application that the map has been loaded
      this.mapInit.emit({
        map: this.map,
        mapView: this.view,//duplicate version of same view for those still referencing mapView
        view: this.view
      });
      this.mapInit.complete();
    });
  }
}
