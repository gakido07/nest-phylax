import { IS_PUBLIC_KEY } from '../src/common/constants';
import { HasRole, Public } from '../src/decorators';

describe('@Public', () => {
  class Test {
    @Public()
    public static method() {}
  }

  it('should enhance method with @Public', () => {
    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, Test.method);
    expect(metadata).toBeDefined();
    expect(metadata).toBe(true);
  });
});

// describe('@Claims', () => {
//   class Test {
//     public static method(@Claims('exp') exp: number) {}
//   }

//   it('should enhance parameter with @Claims', () => {
//     const metadata = Reflect.getMetadata('design:paramtypes', Test.method);
//     expect(metadata).toBeDefined();
//     expect(metadata[0]).toBe(Number);
//   });
// });

describe('@HasRole', () => {
  class Test {
    @HasRole('admin')
    public static method() {}
  }

  it('should enhance method with @HasRole', () => {
    const metadata = Reflect.getMetadata('roles', Test.method);
    expect(metadata).toBeDefined();
    expect(metadata).toEqual(['admin']);
  });
});
