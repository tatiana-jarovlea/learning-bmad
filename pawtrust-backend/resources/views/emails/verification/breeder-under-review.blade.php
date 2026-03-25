@extends('emails.layout')

@section('subject')
  @lang('mail.verification.under_review.subject')
@endsection

@section('content')
  <h2 style="font-size: 18px; margin: 0 0 16px;">
    @lang('mail.verification.under_review.title')
  </h2>
  <p style="margin: 0 0 16px; line-height: 1.6;">
    @lang('mail.verification.under_review.body')
  </p>
@endsection
