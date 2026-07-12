use lib_observer::Rotation;

#[test]
fn rotation_parse_never() {
    assert_eq!(Rotation::parse("never"), Rotation::Never);
}
#[test]
fn rotation_parse_weekly() {
    assert_eq!(Rotation::parse("weekly"), Rotation::Weekly);
}
#[test]
fn rotation_parse_hourly() {
    assert_eq!(Rotation::parse("hourly"), Rotation::Hourly);
}

#[test]
fn rotation_parse_daily() {
    assert_eq!(Rotation::parse("daily"), Rotation::Daily);
}

#[test]
fn rotation_parse_fallback() {
    assert_eq!(Rotation::parse(""), Rotation::Daily);
    assert_eq!(Rotation::parse("monthly"), Rotation::Daily);
    assert_eq!(Rotation::parse("bogus"), Rotation::Daily);
}

#[test]
fn rotation_debug_format() {
    let r = Rotation::Hourly;
    assert_eq!(format!("{r:?}"), "Hourly");
}

#[test]
fn rotation_copy() {
    let a = Rotation::Daily;
    let b = a;
    assert_eq!(a, b);
}
