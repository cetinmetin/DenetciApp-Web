import { Component, HostBinding, AfterViewInit, ViewChild, ElementRef, OnInit, Injectable } from '@angular/core';
import { UpgradableComponent } from 'theme/components/upgradable';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import firebase from "firebase/app";
import 'firebase/storage';
import 'firebase/auth'
import "firebase/firestore";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { NgxSpinnerService } from "ngx-spinner";
import { BlankLayoutCardComponent } from 'app/components/blank-layout-card';
import * as JSZip from 'jszip';
import JSZipUtils from 'jszip-utils/dist/jszip-utils.js';
import saveAs from "jszip/vendor/FileSaver.js";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
@Injectable()
export class ReportsComponent extends BlankLayoutCardComponent implements OnInit {

  columnsToDisplay = ['İsim', 'Soyisim', 'TC Kimlik No', 'Rapor Tarihi', 'Pozisyon'];
  columnsForGetData = ['name', 'surname', 'identityNumber', 'reportDate', 'position']
  columnsForReports = ['Sorular', 'Cevaplar', 'Fotoğraf', 'Video', 'Ses Kaydı']
  columnsForSignatureAndAddress = ['İmza', 'Rapor Adresi']
  dataSource: MatTableDataSource<Officer>;
  dataSource2: MatTableDataSource<QuestionsAndAnswers>
  expandedElement: QuestionsAndAnswers | null;
  users: string[] = []
  reports: any[] = []
  officerInformations: string[] = []
  dates: string[] = []
  quantities: any[][] = []
  photos: any[][] = []
  videos: any[][] = []
  audios: any[][] = []
  signatures: any[][] = []
  reportInformations: Officer[] = []
  officersWhoHaveReported: any[] = []
  officerInformationsForGetData: OfficerInformationsForGetData[] = []

  @HostBinding('class.mdl-grid') public readonly mdlGrid = true;
  @HostBinding('class.mdl-cell') public readonly mdlCell = true;
  @HostBinding('class.mdl-cell--12-col-desktop') public readonly mdlCell12ColDesktop = true;
  @HostBinding('class.mdl-cell--12-col-tablet') public readonly mdlCell12ColTablet = true;
  @HostBinding('class.mdl-cell--4-col-phone') public readonly mdlCell4ColPhone = true;
  @HostBinding('class.mdl-cell--top') public readonly mdlCellTop = true;
  @HostBinding('class.ui-tables') public readonly uiTables = true;
  @HostBinding('class.mdl-grid--no-spacing') public readonly mdlGridNoSpacing = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private spinner: NgxSpinnerService, private httpClient: HttpClient) {
    super();
    this.getReportsAndOfficerInformations().then(() => {
      this.retrieveDataFromFirebaseStorage().then(() => {
        this.fillReportsAndOfficerInformations().then(() => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
        })
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
    })
  }

  fillReportsAndOfficerInformations = async () => {
    this.officersWhoHaveReported.map((user, index) => {
      this.reportInformations.push({
        name: user[1], surname: user[0], identityNumber: user[2],
        reportDate: this.dates[index], position: 'Memur', reportAddress: this.reports[index].Adres,
        questions: this.reports[index].Soru, answers: this.reports[index].Cevap, photos: this.photos[index],
        videos: this.videos[index], signature: this.signatures[index], audios: this.audios[index]
      })
    })
    this.dataSource = new MatTableDataSource(this.reportInformations);
  }

  openImageInNewTab(url) {
    var tab = window.open(url, '_blank');
    tab.focus();
  }

  downloadAsPDF() {
    var doc = new jsPDF('p', 'mm', 'a3')
    const downloadUrlsOfAssets = []
    for (let i = 0; i < this.reportInformations.length; i++) {
      autoTable(doc, {
        head: [
          [
            this.reportInformations[i].name, this.reportInformations[i].surname,
            this.reportInformations[i].identityNumber, this.reportInformations[i].reportDate,
            this.reportInformations[i].position
          ]
        ],
      })
      for (let j = 0; j < this.reportInformations[i].questions.length; j++) {
        autoTable(doc, {
          body: [
            [
              'Soru ' + (j + 1) + ': ' + this.reportInformations[i].questions[j]
            ],
            [
              'Cevap ' + (j + 1) + ': ' + this.reportInformations[i].answers[j]
            ],
          ],
        })
        //for download urls of assets
        if (this.photos[i][j] != undefined) {
          downloadUrlsOfAssets[i] = downloadUrlsOfAssets[i] || [];
          downloadUrlsOfAssets[i].push(this.photos[i][j])
        }

        if (this.videos[i][j] != undefined) {
          downloadUrlsOfAssets[i] = downloadUrlsOfAssets[i] || [];
          downloadUrlsOfAssets[i].push(this.videos[i][j])
        }

        if (this.audios[i][j] != undefined) {
          downloadUrlsOfAssets[i] = downloadUrlsOfAssets[i] || [];
          downloadUrlsOfAssets[i].push(this.audios[i][j])
        }

        if (this.signatures[i][j] != undefined) {
          downloadUrlsOfAssets[i] = downloadUrlsOfAssets[i] || [];
          downloadUrlsOfAssets[i].push(this.signatures[i][j])
        }
      }
    }
    this.zipAndDownloadAssets(downloadUrlsOfAssets, doc)
  }
  zipAndDownloadAssets = (downloadUrlsOfAssets, reportPdf) => {
    var zip = new JSZip();
    var count = 0;
    var counterOfAssets = 0;
    var zipFilename = "Raporlamalar.zip";
    for (let i = 0; i < this.reportInformations.length; i++) {
      counterOfAssets += downloadUrlsOfAssets[i].length
      for (let j = 0; j < downloadUrlsOfAssets[i].length; j++) {
        this.httpClient.get(downloadUrlsOfAssets[i][j], { responseType: 'blob' }).subscribe(response => {
          var filename = firebase.storage().refFromURL(downloadUrlsOfAssets[i][j]).name
          // for adding file extensions to filename
          if (response.type === 'image/jpeg') {
            filename += '.jpeg'
            zip.file((i + 1) + ".Rapor/Fotoğraflar/" + filename, response, { binary: true });
          }
          else if (response.type === 'audio/mpeg') {
            filename += '.mpeg'
            zip.file((i + 1) + ".Rapor/Sesler/" + filename, response, { binary: true });
          }
          else if (response.type === 'video/mp4') {
            filename += '.mp4'
            zip.file((i + 1) + ".Rapor/Videolar/" + filename, response, { binary: true });
          }
          else if (response.type === 'image/png') {
            filename += '.png'
            zip.file((i + 1) + ".Rapor/İmzalar/" + filename, response, { binary: true });
          }
          count++;
          if (count == counterOfAssets) {
            this.spinner.show();
            zip.file('Rapor.pdf', reportPdf.output('blob'));
            zip.generateAsync({ type: 'blob' }).then(function (content) {
              saveAs(content, zipFilename);
            }).then(() => this.spinner.hide())
          }
        })
      }
    }
  }
  firebaseStorageConnection = async (dataType, index) => {

    const surnameNameIdentityNumber = this.officerInformationsForGetData[index].surname
      + ' '
      + this.officerInformationsForGetData[index].name
      + ' '
      + this.officerInformationsForGetData[index].identityNumber
    return await firebase.storage().ref().child(surnameNameIdentityNumber + '/'
      + this.officerInformationsForGetData[index].reportDate.split(' Tarihli')[0] + '/' + dataType + '/').listAll();
  }

  firebaseStorageGetDownloadUrl = async (indexReportDate, dataType, dataList, dataName) => {
    let data = []
    for (let i = 0; i < dataList.length; i++) {
      let index = (dataList[i].name.split(dataName)[1]) //Her sorunun asset cevabının doğru yerleştirilmesi için gerekli indexler
      data[index] = await firebase.storage().ref().child(this.officerInformationsForGetData[indexReportDate].surname
        + ' '
        + this.officerInformationsForGetData[indexReportDate].name
        + ' '
        + this.officerInformationsForGetData[indexReportDate].identityNumber + '/'
        + this.officerInformationsForGetData[indexReportDate].reportDate.split(' Tarihli')[0]
        + dataType + dataList[i].name).getDownloadURL()
    }
    return data
  }

  retrieveDataFromFirebaseStorage = async () => {
    for (let i = 0; i < this.officerInformations.length; i++) {
      this.officersWhoHaveReported.push(this.officerInformations[i].split(' '))
    }

    this.officersWhoHaveReported.map((user, index) => {
      this.officerInformationsForGetData.push({
        name: user[1], surname: user[0], identityNumber: user[2],
        reportDate: this.dates[index]
      })
    })

    for (let j = 0; j < this.officerInformations.length; j++) {

      const photoList = await this.firebaseStorageConnection("photos", j)
      const videoList = await this.firebaseStorageConnection("videos", j)
      const audioList = await this.firebaseStorageConnection("audios", j)
      const signature = await this.firebaseStorageConnection("signature", j)

      this.photos[j] = await this.firebaseStorageGetDownloadUrl(j, "/photos/", photoList.items, 'photo')
      this.videos[j] = await this.firebaseStorageGetDownloadUrl(j, "/videos/", videoList.items, 'video')
      this.audios[j] = await this.firebaseStorageGetDownloadUrl(j, "/audios/", audioList.items, 'audio')
      this.signatures[j] = await this.firebaseStorageGetDownloadUrl(j, "/signature/", signature.items, 'signature')

    }
  }

  getData(data) {
    return new MatTableDataSource<any>(data);
  }

  getReportsAndOfficerInformations = async () => {
    try {
      var tempUsers = await firebase.firestore().collection('Reports').get()
      tempUsers.docs.map(doc => this.users.push(doc.id));
      if (this.users.length > 0) {
        for (let i = 0; i < this.users.length; i++) {
          var tempReports = await firebase.firestore().collection('Reports').doc(this.users[i]).collection('Reports').get()
          tempReports.docs.map(doc => this.officerInformations.push(this.users[i])); //Aynı kullanıcıya ait diğer raporların isim soyisim bilgisi için
        }
        tempReports.docs.map(doc => this.reports.push(doc.data()));
        tempReports.docs.map(doc => this.dates.push(doc.id))
        if (this.reports.length == 0) {
          this.getReportsAndOfficerInformations()
        }
      }
    } catch (e) {
      alert("Raporların Alınması Sırasında Hata " + e)
    }
  }

  ngOnInit(): void {
    this.spinner.show();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

export interface Officer {
  name: string;
  surname: string;
  identityNumber: number;
  reportDate: string;
  position: string;
  signature: any[];
  reportAddress: string;
  questions: any[];
  answers: any[];
  photos: any[];
  videos: any[];
  audios: any[];
}

export interface OfficerInformationsForGetData {
  name: string;
  surname: string;
  identityNumber: number;
  reportDate: string
}

export interface QuestionsAndAnswers {
  questions: any[];
  answers: any[];
}