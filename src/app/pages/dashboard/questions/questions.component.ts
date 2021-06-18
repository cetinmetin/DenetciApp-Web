import { Component, OnInit } from '@angular/core';
import { BlankLayoutCardComponent } from 'app/components/blank-layout-card';
import firebase from "firebase/app";
import 'firebase/storage';
import 'firebase/auth'
import "firebase/firestore";
import { NgxSpinnerService } from "ngx-spinner";
import { FormArray, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent extends BlankLayoutCardComponent implements OnInit {
  questions: any[] = []
  answerMethods: any[] = []
  haveSignature: boolean
  haveLocation: boolean
  questionsAdminForm: FormGroup
  forms: FormArray

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private toastr: ToastrService) {
    super();
    this.callAtFirst()
  }

  ngOnInit(): void {
  }

  onChangeOfCheckboxes = (type: string, i?: number) => {
    if (type == 'text')
      this.answerMethods[i].text = !this.answerMethods[i].text
    else if (type == 'photo')
      this.answerMethods[i].photo = !this.answerMethods[i].photo
    else if (type == 'video')
      this.answerMethods[i].video = !this.answerMethods[i].video
    else if (type == 'voice')
      this.answerMethods[i].voice = !this.answerMethods[i].voice
    else if (type == 'location')
      this.haveLocation = !this.haveLocation
    else if (type == 'signature')
      this.haveSignature = !this.haveSignature
    this.toastr.warning('Değişikliği Uygulamak İçin Güncelle Butonuna Basın', 'Değişiklik Algılandı');
  }
  createForm = async () => {
    this.questionsAdminForm = new FormGroup({
      forms: new FormArray([])
    })
  }
  fillForm = async () => {
    this.forms = this.questionsAdminForm.get('forms') as FormArray;
    for (let i = 0; i < this.questions.length; i++) {
      this.forms.push(this.fb.group({
        questionsForm: this.questions[i]
      }))
    }
  }
  resetStates = () => {
    this.questions = []
    this.answerMethods = []
    this.haveSignature = false
    this.haveLocation = false
    this.questionsAdminForm = new FormGroup({
      forms: new FormArray([])
    })
    this.forms = new FormArray([])
  }
  callAtFirst = async () => {
    this.spinner.show();
    await this.resetStates()
    await this.getQuestionsAnswerMethodsAndTimeStamp()
    await this.getSignatureAndLocationInformations()
    await this.createForm()
    await this.fillForm()
    this.spinner.hide()
  }
  updateSignatureAndLocationInformations = async (location, signature) => {
    await firebase.firestore().collection("SignatureAndLocationInformation").doc("Informations")
      .set({
        location: location,
        signature: signature
      });
  }
  onChange = (newValue, index) => {
    this.questions[index] = newValue
    this.toastr.warning('Değişikliği Uygulamak İçin Güncelle Butonuna Basın', 'Değişiklik Algılandı');
  }
  addQuestion = () => {
    let currentTime  = firebase.firestore.Timestamp.fromDate(new Date());
    console.log(currentTime )
    this.answerMethods.push({ createdAt: currentTime , text: false, photo: false, voice: false, video: false, status: true })
    this.questions.push('')
    this.forms.push(new FormGroup({
      questionsForm: new FormControl([''])
    }))
    this.toastr.warning('Değişikliği Uygulamak İçin Güncelle Butonuna Basın', 'Soru Eklendi');
  }
  questionUp = async (index) => {
    if (index > 0) {
      const timeStampTemp = this.answerMethods[index - 1].createdAt
      this.answerMethods[index - 1].createdAt = this.answerMethods[index].createdAt
      this.answerMethods[index].createdAt = timeStampTemp
      // const temp = (<FormArray>this.questionsAdminForm.get('forms')).at(index)
      // this.forms.removeAt(index)
      // this.forms.insert((index - 1), temp)
      await this.updateQuestions(this.questions, this.answerMethods)
      this.callAtFirst()
    }
  }
  questionDown = async (index) => {
    if (index < (this.questions.length - 1)) {
      const timeStampTemp = this.answerMethods[index + 1].createdAt
      this.answerMethods[index + 1].createdAt = this.answerMethods[index].createdAt
      this.answerMethods[index].createdAt = timeStampTemp
      await this.updateQuestions(this.questions, this.answerMethods)
      this.callAtFirst()
    }
  }
  deleteQuestion = (index) => {
    this.questions.splice(index, 1)
    this.answerMethods.splice(index, 1)
    this.forms.removeAt(index)
    this.toastr.warning('Değişikliği Uygulamak İçin Güncelle Butonuna Basın', 'Soru Silindi');
  }
  updateQuestions = async (questionsProp, answerMethodsProp) => {
    try {
      var documentsToBeDeleted = await firebase.firestore().collection('Questions').get()
      var documentsToBeDeletedArray = []
      documentsToBeDeleted.docs.map(doc => documentsToBeDeletedArray.push(doc.id));
      for (let i = 0; i < documentsToBeDeletedArray.length; i++) {
        firebase.firestore().collection("Questions").doc(documentsToBeDeletedArray[i]).delete()
      }
      for (let i = 0; i < questionsProp.length; i++) {
        firebase.firestore().collection("Questions").doc(questionsProp[i])
          .set({
            text: answerMethodsProp[i].text,
            photo: answerMethodsProp[i].photo,
            createdAt: answerMethodsProp[i].createdAt,
            status: answerMethodsProp[i].status,
            voice: answerMethodsProp[i].voice,
            video: answerMethodsProp[i].video
          });
      }
      await this.updateSignatureAndLocationInformations(this.haveLocation, this.haveSignature)
      this.toastr.success('Güncelleme İşlemi Başarılı');
    } catch (e) {
      this.toastr.error(
        "Soru Güncelleme Sırasında Hata Oluştu",
        "Lütfen Tüm Alanları Eksiksiz Doldurun"
      );
    }
  }
  getQuestionsAnswerMethodsAndTimeStamp = async () => {
    try {
      const getFromFirebase = await firebase.firestore().collection('Questions').orderBy("createdAt", "asc").get()
      getFromFirebase.docs.map(doc => this.questions.push(doc.id))
      getFromFirebase.docs.map(doc => this.answerMethods.push(doc.data()));
    } catch (e) {
      this.toastr.error(e, "Hata");
    }
  }
  getSignatureAndLocationInformations = async () => {
    try {
      const getFromFirebase = await firebase.firestore().collection('SignatureAndLocationInformation')
        .doc("Informations").get()
      this.haveSignature = getFromFirebase.data().signature
      this.haveLocation = getFromFirebase.data().location
    } catch (e) {
      this.toastr.error(e, "İmza Bilgisi Alınırken Hata");
    }
  }
}
