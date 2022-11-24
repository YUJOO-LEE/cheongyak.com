import React from 'react';
import { TypeContent } from '../asset/types';

export default function ContentTable({data}: TypeContent) {
  return (
    <table id='contentTable'>
      <tbody>
        {data.state === '0' ? 
        <>
        <tr>
          <th>모집공고</th>
          <td>{data.openDate} 예정</td>
        </tr>
        </> : <>
        {data.gonggoDate && 
          <tr>
            <th>모집공고</th>
            <td>{data.gonggoDate}</td>
          </tr>
        }
        {data.specialDate && 
          <tr>
            <th>특별 공급 접수</th>
            <td>{data.specialDate}</td>
          </tr>
        }
        {data.nomal1Date && 
          <tr>
            <th>1순위 접수</th>
            <td>{data.nomal1Date}</td>
          </tr>
        }
        {data.nomal2Date && 
          <tr>
            <th>2순위 접수</th>
            <td>{data.nomal2Date}</td>
          </tr>
        }
        {data.announcementDate && 
          <tr>
            <th>당첨자 발표</th>
            <td>{data.announcementDate}</td>
          </tr>
        }
        {data.contractStartDate && 
          <tr>
            <th>계약 기간</th>
            <td>{data.contractStartDate} - {data.contractEndDate}</td>
          </tr>
        }
        {data.dateMoveIn && 
          <tr>
            <th>입주 예정</th>
            <td>{data.dateMoveIn}</td>
          </tr>
        }
        </>}
        {data.url &&
          <tr>
            <th>공식 사이트</th>
            <td>
              <a
                className='linkTargetBlank'
                href={data.url}
                target='_blank' rel="noreferrer"
              >
                {data.url}
                <i className='fa-solid fa-arrow-up-right-from-square'></i>
              </a>
            </td>
          </tr>
        }
      </tbody>
    </table>
  );
}