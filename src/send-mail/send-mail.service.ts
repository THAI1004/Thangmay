import {Injectable} from '@nestjs/common'
@Injectable()
export class SendMailService {
  notificationCreateStaff (password: string, name: string, email: string, Title: string, Message: string) {
    return {
      to: email,
      subject: `${Title}`,
      html: `<!DOCTYPE html>
      <html lang="vi">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yêu cầu đặt lại mật khẩu</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          padding: 30px;
          border-radius: 6px 6px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 900;
        }
        .content {
          text-align: center;
          padding: 20px;
        }
        .content h2 {
          font-size: 24px;
          color: #333333;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .content .password {
          font-size: 20px;
          font-weight: 900;
          color: #007bff;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #007bff;
          border-radius: 5px;
          background-color: #e6f1ff;
        }
        .content .button {
          background-color: #007bff;
          color: #ffffff;
          padding: 12px 25px;
          text-decoration: none;
          font-size: 18px;
          border-radius: 5px;
          margin-top: 20px;
          display: inline-block;
        }
        .content .button:hover {
          background-color: #0056b3;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${Title}</h1>
          </div>
          <div class="content">
            <h2>Xin chào, ${name}</h2>
          <p>${Message}</p>
          <p>Để bảo mật tài khoản vui lòng đổi mật khẩu trong lần đầu đang nhập.</p>
            <p>Để đang nhập vào hệ thống, vui lòng sử dụng mật khẩu mới dưới đây:</p>
            <div class="password">${password}</div>
          <a class="password" style="text-decoration: none; background-color: #007bff; color: white;" href="thangmaytesla.asia/login">Đang nhập ngay</a>
          </div>
          <div class="footer">
            <p>Chúc bạn một ngày tốt lành!<br> Đội ngũ <strong>Thang Máy Tesla</strong></p>
            <p>&copy; 2024 Thang Máy Tesla. Bảo mật và uy tín là cam kết của chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>`,
    }
  }
  notificationNewJob (name: string, email: string, Title: string, Message: string) {
    return {
      to: email,
      subject: `${Title}`,
      html: `<!DOCTYPE html>
      <html lang="vi">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          padding: 30px;
          border-radius: 6px 6px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 900;
        }
        .content {
          text-align: center;
          padding: 20px;
        }
        .content h2 {
          font-size: 24px;
          color: #333333;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .content .password {
          font-size: 20px;
          font-weight: 900;
          color: #007bff;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #007bff;
          border-radius: 5px;
          background-color: #e6f1ff;
        }
        .content .button {
          background-color: #007bff;
          color: #ffffff;
          padding: 12px 25px;
          text-decoration: none;
          font-size: 18px;
          border-radius: 5px;
          margin-top: 20px;
          display: inline-block;
        }
        .content .button:hover {
          background-color: #0056b3;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${Title}</h1>
          </div>
          <div class="content">
            <h2>Xin chào, ${name}</h2>
            <div>${Message}</div>
            <p>Để biết thêm chi tiết về công việc vui lòng đang nhập vào hệ thống.</p>
          </div>
          <div class="footer">
            <p>Chúc bạn một ngày tốt lành!<br> Đội ngũ <strong>Thang Máy Tesla</strong></p>
            <p>&copy; 2024 Thang Máy Tesla. Bảo mật và uy tín là cam kết của chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>`,
    }
  }
  notificationNewProjectManager (name: string, email: string, Title: string, Message: string) {
    return {
      to: email,
      subject: `${Title}`,
      html: `<!DOCTYPE html>
      <html lang="vi">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          padding: 30px;
          border-radius: 6px 6px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 900;
        }
        .content {
          text-align: center;
          padding: 20px;
        }
        .content h2 {
          font-size: 24px;
          color: #333333;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .content .password {
          font-size: 20px;
          font-weight: 900;
          color: #007bff;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #007bff;
          border-radius: 5px;
          background-color: #e6f1ff;
        }
        .content .button {
          background-color: #007bff;
          color: #ffffff;
          padding: 12px 25px;
          text-decoration: none;
          font-size: 18px;
          border-radius: 5px;
          margin-top: 20px;
          display: inline-block;
        }
        .content .button:hover {
          background-color: #0056b3;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${Title}</h1>
          </div>
          <div class="content">
            <h2>Xin chào, ${name}</h2>
            <div>${Message}</div>
            <p>Để biết thêm chi tiết về công việc vui lòng đang nhập vào hệ thống.</p>
          </div>
          <div class="footer">
            <p>Chúc bạn một ngày tốt lành!<br> Đội ngũ <strong>Thang Máy Tesla</strong></p>
            <p>&copy; 2024 Thang Máy Tesla. Bảo mật và uy tín là cam kết của chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>`,
    }
  }
  notificationRemoveKJob (name: string, email: string, Title: string, Message: string) {
    return {
      to: email,
      subject: `${Title}`,
      html: `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  .container {
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  .header {
    text-align: center;
    background-color: #ffeb3b; /* Màu nền vàng */
    color: #333333; /* Màu xám đậm */
    padding: 30px;
    border-radius: 6px 6px 0 0;
  }
  .header h1 {
    margin: 0;
    font-size: 30px;
    font-weight: 900;
  }
  .content {
    text-align: center;
    padding: 20px;
    color: #333333; /* Màu xám đậm */
  }
  .content h2 {
    font-size: 24px;
  }
  .content p {
    font-size: 16px;
  }
  .content .password {
    font-size: 20px;
    font-weight: 900;
    color: #333333; /* Màu xám đậm */
    margin: 20px 0;
    padding: 10px;
    border: 1px solid yellow; /* Màu xám đậm */
    background-color: #fffbd4;
    border-radius: 5px;
  }
  .content .button {
    background-color: #333333; /* Màu xám đậm */
    color: #ffffff;
    padding: 12px 25px;
    text-decoration: none;
    font-size: 18px;
    border-radius: 5px;
    margin-top: 20px;
    display: inline-block;
  }
  .content .button:hover {
    background-color: #2e2e2e; /* Màu xám đậm khi hover */
  }
  .footer {
    text-align: center;
    font-size: 14px;
    color: #666666;
    margin-top: 40px;
  }
  .footer a {
    color: #333333; /* Màu xám đậm */
    text-decoration: none;
  }
  .footer a:hover {
    text-decoration: underline;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thông báo loại khỏi công việc !!!</h1>
    </div>
    <div class="content">
      <h2>Xin chào, ${name}</h2>
      <div class="password">${Message}</div>
    </div>
    <div class="footer">
      <p>Chúc bạn một ngày tốt lành!<br> Đội ngũ <strong>Thang Máy Tesla</strong></p>
      <p>&copy; 2024 Thang Máy Tesla. Bảo mật và uy tín là cam kết của chúng tôi.</p>
    </div>
  </div>
</body>
</html>
`,
    }
  }
  notificationForgotPassword (name: string, email: string, password: string) {
    return {
      to: email,
      subject: 'Thông báo đặt lại mật khẩu',
      html: `<!DOCTYPE html>
      <html lang="vi">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yêu cầu đặt lại mật khẩu</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #007bff;
          color: #ffffff;
          padding: 30px;
          border-radius: 6px 6px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 900;
        }
        .content {
          text-align: center;
          padding: 20px;
        }
        .content h2 {
          font-size: 24px;
          color: #333333;
        }
        .content p {
          font-size: 16px;
          color: #666666;
        }
        .content .password {
          font-size: 20px;
          font-weight: 900;
          color: #007bff;
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #007bff;
          border-radius: 5px;
          background-color: #e6f1ff;
        }
        .content .button {
          background-color: #007bff;
          color: #ffffff;
          padding: 12px 25px;
          text-decoration: none;
          font-size: 18px;
          border-radius: 5px;
          margin-top: 20px;
          display: inline-block;
        }
        .content .button:hover {
          background-color: #0056b3;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #999999;
          margin-top: 40px;
        }
        .footer a {
          color: #007bff;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yêu cầu đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <h2>Xin chào, ${name}</h2>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>Thang Máy Tesla</strong>.</p>
            <p>Để tiếp tục, vui lòng sử dụng mật khẩu mới dưới đây:</p>
            <div class="password">${password}</div>
            <p>Để bảo mật tài khoản của bạn, chúng tôi khuyên bạn thay đổi mật khẩu sau khi đăng nhập.</p>
          </div>
          <div class="footer">
            <p>Chúc bạn một ngày tốt lành!<br> Đội ngũ <strong>Thang Máy Tesla</strong></p>
            <p>&copy; 2024 Thang Máy Tesla. Bảo mật và uy tín là cam kết của chúng tôi.</p>
          </div>
        </div>
      </body>
      </html>`,
    }
  }
  notificationThongBaoBaoTriGanNhat(name: string, email: string, maintenanceDate: string, projectName: string) {
    return {
      to: email,
      subject: 'Thông báo lịch bảo trì sắp tới',
      html: `<!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background-color: #28a745;
          color: #ffffff;
          padding: 30px;
          border-radius: 6px 6px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 900;
        }
        .content {
          text-align: center;
          padding: 20px;
        }
        .content h2 {
          font-size: 22px;
          color: #333;
        }
        .content p {
          font-size: 16px;
          color: #555;
        }
        .highlight {
          font-size: 18px;
          color: #155724;
          background-color: #d4edda;
          padding: 10px;
          margin: 20px 0;
          border: 1px solid #c3e6cb;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #999;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thông báo lịch bảo trì sắp tới</h1>
        </div>
        <div class="content">
          <h2>Xin chào, ${name}</h2>
          <p>Bạn được phân công tham gia bảo trì cho dự án:</p>
          <div class="highlight"><strong>${projectName}</strong></div>
          <p>Thời gian bảo trì dự kiến:</p>
          <div class="highlight"><strong>${maintenanceDate}</strong></div>
          <p>Vui lòng kiểm tra và xác nhận lịch trình trong hệ thống.</p>
        </div>
        <div class="footer">
          <p>Trân trọng,<br>Đội ngũ <strong>Thang Máy Tesla</strong></p>
          <p>&copy; 2025 Thang Máy Tesla. Mọi thông tin xin được bảo mật.</p>
        </div>
      </div>
    </body>
    </html>`
    };
  }
}
