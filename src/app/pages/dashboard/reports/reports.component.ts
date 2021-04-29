import { Component, HostBinding, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
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

  constructor(private spinner: NgxSpinnerService) {
    super();
    this.getReportsAndOfficerInformations().then(() => {
      this.retrieveDataFromFirebaseStorage().then(() => {
        this.fillReportsAndOfficerInformations().then(() => {
          setTimeout(() => {
            this.spinner.hide();
          }, 500);
        })

        //this.getReportQuestionAndAnswerQuantities()
        //For paging
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      })
    })
  }

  fillReportsAndOfficerInformations = async () => {
    // reportInformations = officersWhoHaveReported.map(user => {
    //   let tempReport = { name: user[1], surname: user[0], identityNumber: user[2], reportDate: '', position: 'Memur', reportAddress: '', signature: '' }
    //   this.dates.map(date => tempReport.reportDate.push(date.split('GMT')[0]))
    //   this.reports.map(report => tempReport.reportAddress.push(report.Adres))
    //   return tempReport
    // })
    this.officersWhoHaveReported.map((user, index) => {
      this.reportInformations.push({
        name: user[1], surname: user[0], identityNumber: user[2],
        reportDate: this.dates[index], position: 'Memur', reportAddress: this.reports[index].Adres,
        questions: this.reports[index].Soru, answers: this.reports[index].Cevap, photos: this.photos[index],
        videos: this.videos[index], signature: this.signatures[index], audios: this.audios[index]
      })
    })
    console.log(this.reportInformations)
    this.dataSource = new MatTableDataSource(this.reportInformations);
  }
  // fillQuestionsAndAnswers = () => {

  //   // this.reports.map((report, index) => { questionsAndAnswers.push({ questions: report.Soru, answers: report.Cevap }) })

  //   // this.dataSource2 = new MatTableDataSource(questionsAndAnswers);
  //   // console.log(questionsAndAnswers)
  // }

  // playVideo(event) {
  //   event.toElement.play()
  // }
  // imageToggleSize(className) {
  //   let element = document.querySelector(`.${className}`) as HTMLElement
  //   console.log(className)
  //   if (element.style.width == '100px')
  //     element.style.width = '300px'
  //   else
  //     element.style.width = '100px'
  // }

  openImageInNewTab(url) {
    var tab = window.open(url, '_blank');
    tab.focus();
  }

  downloadAsPDF() {
    var doc = new jsPDF('p', 'mm', 'a3')
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
      }
    }
    doc.save('Raporlamalar.pdf')
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

  firebaseStorageGetDownloadUrl = async (indexReportDate, dataType, max) => {
    let data = []
    for (let i = 0; i < max; i++) {
      data.push(await firebase.storage().ref().child(this.officerInformationsForGetData[indexReportDate].surname
        + ' '
        + this.officerInformationsForGetData[indexReportDate].name
        + ' '
        + this.officerInformationsForGetData[indexReportDate].identityNumber + '/'
        + this.officerInformationsForGetData[indexReportDate].reportDate.split(' Tarihli')[0]
        + '/' + dataType + (i + 1)).getDownloadURL())
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

      for (let i = 0; i < photoList.items.length; i++) {
        this.photos[j] = (await this.firebaseStorageGetDownloadUrl(j, 'photos/foto', photoList.items.length))
      }
      for (let i = 0; i < videoList.items.length; i++) {
        this.videos[j] = (await this.firebaseStorageGetDownloadUrl(j, 'videos/video', videoList.items.length))
      }
      for (let i = 0; i < audioList.items.length; i++) {
        this.audios[j] = (await this.firebaseStorageGetDownloadUrl(j, 'audios/audio', audioList.items.length))
      }
      for (let i = 0; i < signature.items.length; i++) {
        this.signatures[j] = (await this.firebaseStorageGetDownloadUrl(j, 'signature/signature', signature.items.length))
      }
    }
  }

  // getReportQuestionAndAnswerQuantities = () => {
  //   let questionsAndAnswers: QuestionsAndAnswers[] = []
  //   for (let i = 0; i < this.reports.length; i++) {
  //     questionsAndAnswers.push({ questions: this.reports[i].Soru, answers: this.reports[i].Cevap })
  //     // questionsAndAnswers[i].questions = this.reports[i].Soru
  //     // questionsAndAnswers[i].answers = this.reports[i].Cevap
  //   }
  //   for (let i = 0; i < questionsAndAnswers.length; i++) {
  //     this.quantities[i] = [];
  //     for (let j = 0; j < questionsAndAnswers[i].questions.length; j++) {
  //       this.quantities[i][j] = j
  //     }
  //   }
  // }

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

  ngOnInit():void {
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

// import { Component, HostBinding, AfterViewInit, ViewChild } from '@angular/core';
// import { UpgradableComponent } from 'theme/components/upgradable';
// import { TablesService } from '../../ui/tables/tables.service';
// import { animate, state, style, transition, trigger } from '@angular/animations';
// import { MatPaginator } from '@angular/material/paginator';
// import { MatSort } from '@angular/material/sort';
// import { MatTableDataSource } from '@angular/material/table';
// import firebase from "firebase/app";
// import 'firebase/auth'
// import "firebase/firestore";
// import { UnsubscriptionError } from 'rxjs';

// @Component({
//   selector: 'app-reports',
//   templateUrl: './reports.component.html',
//   styleUrls: ['./reports.component.scss'],
//   animations: [
//     trigger('detailExpand', [
//       state('collapsed', style({ height: '0px', minHeight: '0' })),
//       state('expanded', style({ height: '*' })),
//       transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
//     ]),
//   ],
// })

// export class ReportsComponent implements AfterViewInit {

//   columnsToDisplay = ['name', 'surname', 'identityNumber', 'reportDate', 'position'];
//   columnsForReports = ['question', 'answer', 'photo', 'video', 'audioRecord', 'signature', 'address']
//   dataSource: MatTableDataSource<Reports>;
//   dataSource2: MatTableDataSource<QuestionsAndAnswers>
//   expandedElement: QuestionsAndAnswers | null;
//   users = []
//   reports = []
//   userInfos = []
//   dates = []
//   report: Reports[] = []
//   questions = []
//   answers = []
//   @HostBinding('class.mdl-grid') public readonly mdlGrid = true;
//   @HostBinding('class.mdl-cell') public readonly mdlCell = true;
//   @HostBinding('class.mdl-cell--12-col-desktop') public readonly mdlCell12ColDesktop = true;
//   @HostBinding('class.mdl-cell--12-col-tablet') public readonly mdlCell12ColTablet = true;
//   @HostBinding('class.mdl-cell--4-col-phone') public readonly mdlCell4ColPhone = true;
//   @HostBinding('class.mdl-cell--top') public readonly mdlCellTop = true;
//   @HostBinding('class.ui-tables') public readonly uiTables = true;

//   @ViewChild(MatPaginator) paginator: MatPaginator;
//   @ViewChild(MatSort) sort: MatSort;

//   constructor() {
//     this.getReportsAndOfficerInformations().then(() => {
//       this.officersWhoHaveReported()

//       //For paging
//       this.dataSource.paginator = this.paginator;
//       this.dataSource.sort = this.sort;
//     })
//   }

//   officersWhoHaveReported = () => {
//     let tempUser = []
//     let questionsAndAnswers: QuestionsAndAnswers[] = []
//     for (let i = 0; i < this.userInfos.length; i++) {
//       tempUser.push(this.userInfos[i].split(' '))
//     }
//     this.report = tempUser.map(user => {
//       let userObject = { name: user[1], surname: user[0], identityNumber: user[2], date: '', position: 'Memur', report: '', questions: [] = [], answers: [] = [] }
//       this.dates.map(date => userObject.date = date.split('GMT')[0])
//       this.reports.map(report => userObject.report = report)
//       this.reports.map(report => this.questions = report.Soru)
//       this.reports.map(report => this.answers = report.Cevap)
//       return userObject
//     })
//     for (let i = 0; i < this.questions.length; i++) {
//       questionsAndAnswers.push({ questions: this.questions[i], answers: this.answers[i] })
//       this.dataSource2 = new MatTableDataSource(questionsAndAnswers)
//     }
//     // Assign the data to the data source for the table to render
//     this.dataSource = new MatTableDataSource(this.report);
//   }
//   getQuestionsAndAnswers = () => {

//   }
//   getReportsAndOfficerInformations = async () => {
//     try {
//       this.users = []
//       this.reports = []
//       this.userInfos = []
//       var tempUsers = await firebase.firestore().collection('Reports').get()
//       tempUsers.docs.map(doc => this.users.push(doc.id));
//       if (this.users.length > 0) {
//         for (let i = 0; i < this.users.length; i++) {
//           var tempReports = await firebase.firestore().collection('Reports').doc(this.users[i]).collection('Reports').get()
//           tempReports.docs.map(doc => this.reports.push(doc.data()));
//           tempReports.docs.map(doc => this.dates.push(doc.id))
//           tempReports.docs.map(doc => this.userInfos.push(this.users[i])); //Aynı kullanıcıya ait diğer raporların isim soyisim bilgisi için
//         }
//         if (this.reports.length == 0) {
//           this.getReportsAndOfficerInformations()
//         }
//       }
//     } catch (e) {
//       alert("Raporların Alınması Sırasında Hata " + e)
//     }
//   }
//   ngAfterViewInit() {
//   }

//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     this.dataSource.filter = filterValue.trim().toLowerCase();

//     if (this.dataSource.paginator) {
//       this.dataSource.paginator.firstPage();
//     }
//   }
// }

// export interface Reports {
//   name: string;
//   surname: string;
//   identityNumber: number;
//   date: string;
//   report: string;
//   position: string;
//   questions: string[];
//   answers: string[];
// }
// export interface QuestionsAndAnswers {
//   questions: [];
//   answers: [];
// }
