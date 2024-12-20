#![feature(unbounded_shifts)]

use std::sync::{Arc, Mutex};
use std::thread::sleep;
use std::time::Duration;
use rayon::prelude::*;
use rayon_progress::ProgressAdaptor;

fn encrypt(data: &[u8], key: u32) -> Vec<u8> {
    let mut checksum = 0u8;

    data.iter().map(|x| {
        let val = x.overflowing_add(checksum).0.overflowing_add(key.unbounded_shr((checksum % 32) as u32) as u8).0;
        checksum = checksum.overflowing_add(*x).0;
        val
    }).collect()
}

fn decrypt(data: &[u8], key: u32) -> (Vec<u8>, u8) {
    let mut checksum = 0u8;

    (data.iter().map(|x| {
        let val = x.overflowing_sub(checksum).0.overflowing_sub(key.unbounded_shr((checksum % 32) as u32) as u8).0;
        checksum = checksum.overflowing_add(val).0;
        val
    }).collect(), checksum)
}


fn main() {
    println!("{:x?}", "Hello, world!".as_bytes());
    println!("{:x?}", encrypt("Hello, world!".as_bytes(), 1234));
    println!("{:x?}", decrypt(&encrypt("Hello, world!".as_bytes(), 1234), 1234));

    println!("{:x?}", decrypt(
    &[0x2a,0x2a,0x2b,0x16,0x16,0x17,0x0c,0x0c,0x0d,0x08,0x08,0x08,0x48,0x49,0xc6,0xc6,0xc9,0xf9,0x9f,0x0e,0xa1,0xa1,0xa1,0xe4,0xb3,0xb3,0x9a,0x4b,0xa4,0x98,0x40,0xc6,0x85,0x55,0x07,0xb3,0xb3,0xb6,0xa2,0x9f,0x9f],
    1725093930,
    ));

    // let keys = ProgressAdaptor::new(0..u32::MAX);
    // let progress = keys.items_processed();
    // let total = keys.len();
    // let result = Arc::new(Mutex::new(None::<Vec<u32>>));
    //
    // rayon::spawn({
    //     let result = result.clone();
    //     move || {
    //         let msg = [0x91,0x91,0x92,0xc9,0xc9,0xca,0xe6,0xe6,0xe7,0x75,0x75,0x75,0xb5,0xb6,0x7d,0x7d,0x80,0x70,0x3c,0x3d,0x38,0x38,0x38,0x7b,0x86,0xa1,0xc9,0xb2,0x57,0x87,0x6f,0xb4,0x73,0x30,0x9e,0xce,0xce,0xd1,0xa5,0xa0,0xa0];
    //         let keys = keys.filter(|key| {
    //             let msg = decrypt(&msg, *key);
    //             let good = msg.1 == 0x9f && msg.0[0] == 0 && msg.0[1] == 0;
    //             good
    //         });
    //         let msg = [0x04,0xcf,0xc1,0x1b,0x24,0x24,0x24];
    //         let keys = keys.filter(|key| {
    //             let msg = decrypt(&msg, *key);
    //             let good = msg.1 == 0x12;
    //             good
    //         });
    //         let msg = [0x95,0x3d,0x3d,0x3d,0x3d,0x3d,0x3d,0x3d];
    //         let keys = keys.filter(|key| {
    //             let msg = decrypt(&msg, *key);
    //             let good = msg.1 == 0x04;
    //             good
    //         });
    //         let msg = [0x04,0xcf,0xc1,0x1b,0x24];
    //         let keys = keys.filter(|key| {
    //             let msg = decrypt(&msg, *key);
    //             let good = msg.1 == 0x12;
    //             if good {
    //                 println!("Found key: {:x?}", key);
    //             };
    //             good
    //         });
    //         *result.lock().unwrap() = Some(keys.collect());
    //     }
    // });
    //
    // while result.lock().unwrap().is_none() {
    //     let percent = (progress.get() * 100) / total;
    //     println!("Processing... {}% complete", percent);
    //     sleep(Duration::from_secs(10));
    // }
    // if let Some(result) = result.lock().unwrap().take() {
    //     println!("Done! Result was: {:x?}", result);
    // };
}