# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "this" {
  name                              = var.name
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Cache Policy
resource "aws_cloudfront_cache_policy" "this" {
  name        = "${var.name}-cache-policy"
  comment     = "Cache policy for ${var.domain_name}"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 1

  parameters_in_cache_key_and_forwarding_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    headers_config {
      header_behavior = "none"
    }

    cookies_config {
      cookie_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# CloudFront Function for SPA routing
resource "aws_cloudfront_function" "spa_routing" {
  name    = "${var.name}-spa-routing"
  runtime = "cloudfront-js-2.0"
  comment = "SPA URI rewrite for ${var.domain_name}"
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      var uri = request.uri;

      // Check whether the URI is missing a file extension
      if (!uri.includes('.')) {
        request.uri = '/index.html';
      }

      return request;
    }
  EOF
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.domain_name} - ${var.environment}"
  default_root_object = "index.html"
  price_class         = var.price_class
  aliases             = var.aliases

  origin {
    domain_name              = var.origin_domain_name
    origin_id                = "S3-${var.name}"
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.name}"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.this.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_routing.arn
    }
  }

  # SPA error responses - return index.html for 403/404
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = var.waf_web_acl_arn

  tags = var.tags

  depends_on = [aws_cloudfront_origin_access_control.this]
}
