@extends('emails.layout')

@section('subject')
  @lang('mail.verification.admin_new_request.subject', ['kennel_name' => $kennel_name])
@endsection

@section('content')
  <h2 style="font-size: 18px; margin: 0 0 16px;">
    @lang('mail.verification.admin_new_request.title')
  </h2>
  <p style="margin: 0 0 16px; line-height: 1.6;">
    @lang('mail.verification.admin_new_request.body', [
        'name'        => $breeder_name,
        'email'       => $breeder_email,
        'kennel_name' => $kennel_name,
    ])
  </p>
  <a href="{{ $adminUrl }}"
     style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
    @lang('mail.verification.admin_new_request.cta')
  </a>
@endsection
