use crate::algo::cert_blender::BlendError::OutOfBoundsSegment;
use thiserror::Error;

const SEGMENTS: [u8; 8] = [
    // shift
    0,  // 8765_43|21| -> 0000_0021
    4,  // 8765_4|32|1 -> 0000_0032
    8,  // 8765_|43|21 -> 0000_0043
    12, // 876|5_4|321 -> 0000_0054
    16, // 87|65|_4321 -> 0000_0065
    20, // 8|76|5_4321 -> 0000_0076
    24, // |87|65_4321 -> 0000_0087
    28, // |8|765_4321 -> 0000_0008
];

#[derive(Debug, Error)]
pub enum BlendError {
    #[error("Segment out of bounds")]
    OutOfBoundsSegment,
}

pub fn blend(old_key: u32, pwd: &[u8]) -> Result<u32, BlendError> {
    // Setup increment multiplier
    let prefix = pwd[0] as u32;
    let increment_multiplier = (prefix << 3) as f32 * 0.00390625;
    let pwd = &pwd[1..];

    // Convert buffer to a buffer of nibbles for ease of use
    let pwd = pwd
        .iter()
        .flat_map(|&x| {
            let x = x as u32;
            [x >> 4, x & 0x0f]
        })
        .collect::<Vec<_>>();

    let mut result = 0;
    for shift in SEGMENTS {
        let tmp = (old_key >> shift) as u8;
        let tmp = (tmp as f32 * increment_multiplier).floor() as i64 as u32;
        result |= pwd.get(tmp as usize).ok_or(OutOfBoundsSegment)? << shift;
    }
    Ok(old_key.wrapping_add(result))
}

#[cfg(test)]
mod tests {
    use crate::algo::cert_blender::blend;
    use assert_matches::assert_matches;

    #[test]
    fn expected_values() {
        assert_matches!(
            blend(
                0x12345678,
                &hex::decode("03355ceda951f97d594fd471d5").unwrap()
            ),
            Ok(1208155025)
        );
        assert_matches!(
            blend(
                0x87654321,
                &hex::decode("03355ceda951f97d594fd471d5").unwrap()
            ),
            Ok(3203849741)
        );
    }
}
