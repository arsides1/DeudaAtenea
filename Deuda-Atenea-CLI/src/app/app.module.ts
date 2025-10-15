import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { NgxImageComparisonSliderModule } from 'ngx-image-comparison-slider';
import { environment } from 'src/environments/environment';
// import {AngularFireModule} from '@angular/fire'
// import { AngularFireAuthModule } from '@angular/fire/auth';
// import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { AngularFireDatabaseModule } from '@angular/fire/database';
import { LoginPageComponent } from './authentication/login-page/login-page.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
//<<<<<<< HEAD

import {MatDatepickerModule} from '@angular/material/datepicker';
//=======
import {MatStepperModule} from '@angular/material/stepper';
import { NgxSpinnerModule} from 'ngx-spinner'
import { InterceptorService } from './components/interceptor.service';
import { ProdInterceptorService } from './interceptors/prod-interceptor.service';
import { ForgotPasswordComponent } from './authentication/login-page/forget-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/login-page/forget-password/reset-password/reset-password.component';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';


@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule, ReactiveFormsModule,
    NgxImageComparisonSliderModule ,
    HttpClientModule,
    MatSelectModule,
    MatStepperModule,
    MatDatepickerModule,
    NgxSpinnerModule,
    NgxCaptchaModule,
    NgSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  providers: [ 
       {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi:true }


  ], //intreceptorProvider
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
