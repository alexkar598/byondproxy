fn encrypt(input: &[u8], key: u32) -> Vec<u8> {
    let mut data = Vec::with_capacity(input.len() + 1);
    input.clone_into(&mut data);

    let checksum = data.iter_mut().fold(0u8, |checksum, x| {
        let val = x
            .overflowing_add(checksum)
            .0
            .overflowing_add(key.unbounded_shr((checksum % 32) as u32) as u8)
            .0;
        let new_checksum = checksum.overflowing_add(*x).0;
        *x = val;
        new_checksum
    });
    data.push(checksum);
    data
}

fn decrypt(data: &[u8], key: u32) -> Option<Vec<u8>> {
    let mut checksum = 0u8;

    let result = data[..data.len() - 1]
        .iter()
        .map(|x| {
            let val = x
                .overflowing_sub(checksum)
                .0
                .overflowing_sub(key.unbounded_shr((checksum % 32) as u32) as u8)
                .0;
            checksum = checksum.overflowing_add(val).0;
            val
        })
        .collect();

    if checksum == data[data.len() - 1] {
        Some(result)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use crate::algo::runsub::{decrypt, encrypt};
    use assert_matches::assert_matches;

    #[test]
    fn cycle() {
        let input = b"Hello, world!";

        assert_matches!(&decrypt(&encrypt(input, 0x12345678), 0x12345678), Some(x) if x == input);
    }

    #[test]
    fn encrypt_known() {
        let input = b"Hello, world!";

        assert_eq!(encrypt(input, 0x12345678), [
            0xc0, 0x03, 0xbb, 0x8e, 0xa7, 0x43, 0xb8, 0x2f, 0x4a, 0xf1, 0x16, 0xcf, 0xdf, 0x89
        ])
    }

    #[test]
    fn decrypt_known() {
        let input = [
            0xc0, 0x03, 0xbb, 0x8e, 0xa7, 0x43, 0xb8, 0x2f, 0x4a, 0xf1, 0x16, 0xcf, 0xdf, 0x89,
        ];

        assert_matches!(decrypt(&input, 0x12345678), Some(x) if x == b"Hello, world!");
    }

    #[test]
    fn decrypt_failed_checksum() {
        let input = [
            0xc0, 0x03, 0xbb, 0x8e, 0xa7, 0x43, 0xb8, 0x2f, 0x4a, 0xf1, 0x16, 0xcf, 0xdf, 0x89,
        ];

        assert_matches!(decrypt(&input, 0x87654321), None);
    }
}
