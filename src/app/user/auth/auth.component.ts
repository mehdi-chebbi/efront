import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { UserServiceService } from 'src/services/user-service.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  user: any = {};
  userId!: string;

  constructor(private fb: FormBuilder, private userService: UserServiceService, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.userService.loginUser(email, password).subscribe(
      (response) => {
        if (!response.token) {
          console.error('Token non trouvé');
          return;
        }

        // Stocker le token
        this.userService.storeToken(response.token);

        try {
          // Décoder le token pour extraire l'ID utilisateur
          const decodedToken: any = jwt_decode(response.token);
          this.userId = decodedToken.userId;

          if (!this.userId) {
            console.error("ID utilisateur introuvable dans le token");
            return;
          }

          // Récupérer les détails de l'utilisateur
          this.userService.getUserDetails(this.userId).subscribe(
            (data) => {
              this.user = data;

              // Vérifier le rôle de l'utilisateur et rediriger
              if (this.user?.role === "administrateur") {
                this.router.navigate(['/admin/dash']);
              } else  {
                this.router.navigate(['/user/home']);
              }
            },
            (error) => {
              console.error("Erreur lors de la récupération des détails de l'utilisateur :", error);
            }
          );

        } catch (error) {
          console.error("Erreur lors du décodage du token :", error);
        }
      },
      (error) => {
        // Gérer l'erreur d'authentification
        this.errorMessage = error.error?.message || 'Email ou mot de passe invalide';
      }
    );
  }
}
