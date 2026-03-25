<!DOCTYPE html>
<html lang="{{ $locale ?? config('app.locale') }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>@yield('subject')</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="margin-bottom: 24px;">
    <strong style="font-size: 20px; color: #16a34a;">PawTrust</strong>
  </div>
  @yield('content')
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
  <p style="font-size: 12px; color: #6b7280;">
    PawTrust · Moldova<br>
    @lang('mail.footer_unsubscribe_note')
  </p>
</body>
</html>
