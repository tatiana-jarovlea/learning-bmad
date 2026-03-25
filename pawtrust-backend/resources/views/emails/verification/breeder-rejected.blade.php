@extends('emails.layout')

@section('subject')
  @lang('mail.verification.rejected.subject')
@endsection

@section('content')
  <h2 style="font-size: 18px; margin: 0 0 16px;">
    @lang('mail.verification.rejected.title')
  </h2>
  <p style="margin: 0 0 16px; line-height: 1.6;">
    @lang('mail.verification.rejected.body')
  </p>
  <blockquote style="border-left: 4px solid #e5e7eb; padding: 8px 16px; margin: 0 0 16px; color: #4b5563; font-style: italic;">
    {{ $admin_notes }}
  </blockquote>
  <p style="margin: 0 0 16px; line-height: 1.6;">
    @lang('mail.verification.rejected.resubmit_note')
  </p>
  <a href="{{ $dashboardUrl }}"
     style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
    @lang('mail.verification.rejected.cta')
  </a>
@endsection
