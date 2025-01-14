import { Page, StackLayout, TextField, Button, Label } from '@nativescript/core';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export class LoginPage extends Page {
  private emailField: TextField;
  private passwordField: TextField;
  private errorLabel: Label;

  constructor() {
    super();
    
    const layout = new StackLayout();
    layout.className = 'p-4';

    // Title
    const titleLabel = new Label();
    titleLabel.text = 'Safetrac Mobile';
    titleLabel.className = 'text-2xl font-bold text-center mb-8';
    layout.addChild(titleLabel);

    // Email field
    this.emailField = new TextField();
    this.emailField.hint = 'Email';
    this.emailField.keyboardType = 'email';
    this.emailField.autocorrect = false;
    this.emailField.autocapitalizationType = 'none';
    this.emailField.className = 'input mb-4 p-4';
    layout.addChild(this.emailField);

    // Password field
    this.passwordField = new TextField();
    this.passwordField.hint = 'Password';
    this.passwordField.secure = true;
    this.passwordField.className = 'input mb-4 p-4';
    layout.addChild(this.passwordField);

    // Error label
    this.errorLabel = new Label();
    this.errorLabel.className = 'text-red-500 text-center mb-4';
    layout.addChild(this.errorLabel);

    // Login button
    const loginButton = new Button();
    loginButton.text = 'Sign In';
    loginButton.className = 'btn btn-primary p-4';
    loginButton.on('tap', this.onLoginTap.bind(this));
    layout.addChild(loginButton);

    this.content = layout;
  }

  private async onLoginTap() {
    try {
      this.errorLabel.text = '';
      
      const email = this.emailField.text;
      const password = this.passwordField.text;

      if (!email || !password) {
        this.errorLabel.text = 'Please enter both email and password';
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      
      // Navigate to main page on success
      // this.frame.navigate({ moduleName: 'pages/main-page' });
    } catch (error) {
      this.errorLabel.text = (error as Error).message;
    }
  }
}