@extends('emails.layout')

@section('subject')
  @lang('mail.verification.approved.subject')
@endsection

@section('content')
  <h2 style="font-size: 18px; margin: 0 0 16px;">
    @lang('mail.verification.approved.title')
  </h2>
  <p style="margin: 0 0 16px; line-height: 1.6;">
    @lang('mail.verification.approved.body')
  </p>
  <a href="{{ $profileUrl }}"
     style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
    @lang('mail.verification.approved.cta')
  </a>
@endsection
