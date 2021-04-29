import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BlankLayoutCardComponent } from 'app/components/blank-layout-card';
import { AuthService } from '../../../services/auth';
import { User } from "../../../models/user";
import { UserService } from "../../../services/user.service";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',
  styleUrls: ['../../../components/blank-layout-card/blank-layout-card.component.scss'],
  templateUrl: './login.component.html',
})
export class LoginComponent extends BlankLayoutCardComponent implements OnInit {

  public loginForm: FormGroup;
  public email;
  public password;
  public emailPattern = '^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$';
  public error: string;
  public createUser;
  public isAdmin;

  constructor(public authService: AuthService,
    public fb: FormBuilder,
    public router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService) {
    super();

    this.loginForm = this.fb.group({
      password: new FormControl('', Validators.required),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern),
        Validators.maxLength(20),
      ]),
    });
    this.email = this.loginForm.get('email');
    this.password = this.loginForm.get('password');
    this.createUser = new User();
  }

  public ngOnInit() {
    this.logOut()
    this.spinner.hide()
  }
  logOut() {
    this.authService.logout();
    this.spinner.hide()
    this.loginForm.valueChanges.subscribe(() => {
      this.error = null;
    });
  }
  signInWithEmail() {
    this.authService
      .signInRegular(this.email.value, this.password.value)
      .then((res) => {
        this.spinner.show()
        this.authService.getUserInformation().then((currentUser) => {
          this.isAdmin = currentUser.isAdmin
        }).then(() => {
          if (this.isAdmin) {
            this.toastr.success('Giriş Başarılı', 'Hoşgeldiniz');
            const returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
            setTimeout(() => {
              this.router.navigate([returnUrl || "/"]);
              this.spinner.hide()
            }, 1500);
            this.router.navigate(["/"]);
          }
          else {
            this.logOut()
            this.spinner.hide()
            this.toastr.error(
              "Hesabınız Yönetici Ayrıcalıklarına Sahip Değil",
              "Erişim Engellendi"
            );
          }
        })
      })
      .catch((err) => {
        this.toastr.error(
          "Geçersiz Kimlik Bilgileri, Lütfen Kimlik Bilgilerinizi Kontrol Edin",
          "Doğrulama Başarısız"
        );
      });
  }

  public onInputChange(event) {
    event.target.required = true;
  }
}
